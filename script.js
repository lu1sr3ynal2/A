document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const tipo = $('tipoSala'), num = $('numeroSala'), box = $('box'), lblNum = $('labelNumeroSala'),
    cur = $('curativoGeral'), copyBtn = $('copyBtn'), alerg = $('alergias'), dec = $('decubito'),
    nome = $('nome'), acomp = $('acompanha'), neu = $('consciencia'), neuBtn = $('consciencia-btn'),
    vent = $('ventilacao'), ventBtn = $('ventilacao-btn'), litros = $('litros'),
    diet = $('dieta'), dietBtn = $('dieta-btn'), nota = $('nota'), acoes = $('acoes');

  const cfg = {
    UDC: { salas: [1, 2, 3, 4], box: ['POLTRONA 1', 'POLTRONA 2', 'POLTRONA 3', 'POLTRONA 4', 'POLTRONA 5'] },
    OBSERVAÇÃO: { salas: [1, 2, 3], box: [1, 2, 3, 4] },
    INTERMEDIARIA: { salas: [], box: [1, 2, 3, 4] },
    RESPIRATORIA: { salas: [], box: [1, 2, 3, 4] },
    CARDIONEURO: { salas: [], box: [1, 2, 3, 4] },
    VERMELHA: { salas: [], box: [1, 2, 3, 4] },
    CARDIOLOGICA: { salas: [], box: [1, 2, 3, 4] },
    ISOLAMENTO: { salas: [15, 16], box: ['A', 'B'] }
  };

  const maps = {
    neu: {
      ALERTA: 'ALERTA, LÚCIDO, ORIENTADO E COERENTE',
      LUCIDO: 'LÚCIDO COM PERÍODOS DE CONFUSÃO',
      CONFUSO: 'CONFUSO',
      LETARGICO: 'LETÁRGICO',
      SEM_RELACAO: 'SEM RELAÇÃO DE VIDA'
    },
    vent: {
      AA: () => 'VENTILANDO EM AR AMBIENTE.',
      OC: l => `VENTILANDO POR ÓCULOS NASAL A ${l}L.`,
      MV: l => `VENTILANDO POR MÁSCARA VENTURI A ${l}L.`,
      MH: l => `VENTILANDO POR MÁSCARA DE HUDSON A ${l}L.`
    },
    diet: {
      ABVO: 'VO LIBERADA COM BOA ACEITAÇÃO.',
      VO_POUCA: 'VO LIBERADA COM POUCA ACEITAÇÃO.',
      NPO: 'EM NPO.'
    },
    elim: {
      BANHEIRO: 'ELIMINAÇÕES NO BANHEIRO.',
      FRALDA: 'ELIMINAÇÕES EM FRALDA.',
      AMBAS: 'ELIMINAÇÕES NO BANHEIRO E FRALDA PARA CONFORTO.'
    },
    deam: {
      RESTRITO: 'RESTRITO AO LEITO.',
      DEAMBULA: 'DEAMBULA.',
      DEAMBULA_AUX: 'DEAMBULA COM AUXÍLIO.'
    },
    acc: {
      acc1: 'ACESSO VENOSO PERIFÉRICO EM MEMBRO SUPERIOR DIREITO',
      acc2: 'ACESSO VENOSO PERIFÉRICO EM MEMBRO SUPERIOR ESQUERDO',
      acc3: 'PICC',
      acc4: 'PORT-A-CATH'
    },
    dec: {
      DORSAL: 'EM DECÚBITO DORSAL',
      LATERAL_ESQ: 'EM DECÚBITO LATERAL ESQUERDA',
      LATERAL_DIR: 'EM DECÚBITO LATERAL DIREITA'
    }
  };

  const preencher = (el, arr) => { el.innerHTML = ''; arr.forEach(v => el.appendChild(new Option(v, v))); };

  const updSel = () => {
    if (tipo.value === 'OBSERVAÇÃO' || tipo.value === 'UDC') {
      lblNum.style.display = '';
      preencher(num, cfg[tipo.value].salas);
    } else {
      lblNum.style.display = 'none';
      num.innerHTML = '';
    }
    preencher(box, cfg[tipo.value].box);
    gen();
  };

  tipo.onchange = updSel;

  // Solo enlazar a los <a> con data-value para evitar clicks en padres sin valor
  [['.menu-neuro', 'consciencia', neuBtn], ['.menu-ventilacion', 'ventilacao', ventBtn], ['.menu-dieta', 'dieta', dietBtn]].forEach(([sel, id, btn]) => {
    document.querySelectorAll(`${sel} a[data-value]`).forEach(a => {
      a.onclick = e => {
        e.preventDefault();
        $(id).value = a.dataset.value;
        if (id === 'ventilacao') litros.value = a.dataset.litros || '';
        btn.textContent = a.textContent;
        gen();
      };
    });
  });

  document.querySelectorAll('input,select,textarea').forEach(el => { el.oninput = gen; el.onchange = gen; });

  ['gastro-mlh', 'sne-mlh', 'sng-mlh'].forEach(id => {
    $(id).oninput = gen;
    $(id).onchange = gen;
  });

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(nota.innerText);
    copyBtn.textContent = 'COPIADO!';
    setTimeout(() => copyBtn.textContent = 'COPIAR EVOLUÇÃO', 2000);
  };

  updSel();

  function gen() {
    const t = tipo.value,
      nt = t.replace('_', ' '),
      bxv = box.value,
      nv = neu.value,
      vv = vent.value,
      dv = diet.value,
      lv = litros.value;

    let sala;
    if (tipo.value === 'UDC') {
      sala = `EMERGÊNCIA ADULTO - ${nt} ${num.value} - ${bxv}`;
    } else if (tipo.value === 'OBSERVAÇÃO') {
      sala = `EMERGÊNCIA ADULTO - ${nt} ${num.value} - BOX ${bxv}`;
    } else {
      sala = `EMERGÊNCIA ADULTO - ${nt} - BOX ${bxv}`;
    }

    const lines = [sala, ''];

    const alg = alerg.value.trim().toUpperCase();
    if (alg) lines.push(`#ALERGIAS: ${alg}`, '');

    const nomev = nome.value.trim().toUpperCase(),
      acm = acomp.value === 'Sim' ? 'COM ACOMPANHANTE' : 'SEM ACOMPANHANTE';
    if (nomev) {
      lines.push(`RECEBO PACIENTE ${nomev}, ${acm}.`);
      const decText = maps.dec[dec.value] || '';
      if (decText) lines.push(decText);
    }

    lines.push(
      maps.neu[nv],
      typeof maps.vent[vv] === 'function' ? maps.vent[vv](lv) : maps.vent[vv],
      maps.diet[dv]
    );

    ['acc1', 'acc2', 'acc3', 'acc4'].forEach(id => {
      if ($(id).checked) {
        let d = maps.acc[id];
        if (id === 'acc1' || id === 'acc2') {
          const c = $(`cateter-${id}`).value;
          if (c) d += ` CATETER ${c}`;
        }
        d += `. ${cur.checked
          ? 'CURATIVO LIMPO E SECO SEM SINAIS FLOGÍSTICOS NO SÍTIO DA INSERÇÃO.'
          : 'CURATIVO A SER AVALIADO.'}`;
        lines.push(d);
      }
    });

    if ($('dispGastro').checked) {
      const mlh = parseInt($('gastro-mlh').value) || 0;
      if (mlh > 0) lines.push(`RECEBENDO DIETA POR GASTROSTOMIA A ${mlh} ML/H.`);
      else lines.push('COM GASTROSTOMIA.');
    }
    if ($('dispSNE').checked) {
      const mlh = parseInt($('sne-mlh').value) || 0;
      if (mlh > 0) lines.push(`RECEBENDO DIETA POR SONDA NASOENTERICA A ${mlh} ML/H.`);
      else lines.push('COM SONDA NASOENTERICA.');
    }
    if ($('dispSNG').checked) {
      const mlh = parseInt($('sng-mlh').value) || 0;
      if (mlh > 0) lines.push(`RECEBENDO DIETA POR SONDA NASOGASTRICA A ${mlh} ML/H.`);
      else lines.push('COM SONDA NASOGASTRICA.');
    }

    const elm = maps.elim[$('elimTipo').value],
      dm = maps.deam[$('deambula').value];
    if (elm) lines.push(elm);
    if (dm) lines.push(dm);

    lines.push('');
    acoes.value.trim().toUpperCase().split('\n').filter(l => l.trim()).forEach(l => lines.push(l));

    nota.innerText = lines.join('\n');
  }
});