let animais = [];
let vacinas = [];
let abates = [];
let alimentacoes = [];
let proximoId = 1;
let seq = 1;

function formatarId(n){
  return String(n).padStart(4, '0');
}

document.getElementById('proximo-id').textContent = formatarId(proximoId);

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab === 'visao') renderVisaoGeral();
    if(btn.dataset.tab === 'abate') renderGruposAbate();
  });
});

function fmtData(iso){
  if(!iso) return '-';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// CADASTRO
document.getElementById('form-animal').addEventListener('submit', e => {
  e.preventDefault();
  animais.push({
    id: proximoId,
    idFormatado: formatarId(proximoId),
    nome: document.getElementById('an-nome').value.trim(),
    raca: document.getElementById('an-raca').value,
    sexo: document.getElementById('an-sexo').value,
    peso: document.getElementById('an-peso').value,
    grupo: document.getElementById('an-grupo').value.trim(),
    status: 'Ativo'
  });
  proximoId++;
  document.getElementById('proximo-id').textContent = formatarId(proximoId);
  e.target.reset();
  renderAnimais();
});

function renderAnimais(){
  const tbody = document.getElementById('tbl-cadastro');
  tbody.innerHTML = animais.map(a => `
    <tr>
      <td>${a.idFormatado}</td>
      <td>${a.nome || '-'}</td>
      <td>${a.raca}</td>
      <td>${a.sexo}</td>
      <td>${a.peso ? a.peso + ' kg' : '-'}</td>
      <td>${a.grupo || '-'}</td>
      <td>${a.status}</td>
      <td><button onclick="removerAnimal(${a.id})">Remover</button></td>
    </tr>`).join('');
  populateAnimalSelect();
}

function removerAnimal(id){
  animais = animais.filter(a => a.id !== id);
  vacinas = vacinas.filter(v => v.animalId !== id);
  renderAnimais();
  renderVacinas();
}

function populateAnimalSelect(){
  const sel = document.getElementById('vc-animal');
  const ativos = animais.filter(a => a.status === 'Ativo');
  sel.innerHTML = ativos.length
    ? ativos.map(a => `<option value="${a.id}">${a.idFormatado}${a.nome ? ' - ' + a.nome : ''}</option>`).join('')
    : '<option value="">Cadastre um animal primeiro</option>';
}

// VACINAS
document.getElementById('form-vacina').addEventListener('submit', e => {
  e.preventDefault();
  const animalId = parseInt(document.getElementById('vc-animal').value);
  if(!animalId){ alert('Cadastre um animal antes.'); return; }
  vacinas.push({
    id: seq++,
    animalId,
    vacina: document.getElementById('vc-nome').value.trim(),
    data: document.getElementById('vc-data').value,
    proxima: document.getElementById('vc-proxima').value,
    obs: document.getElementById('vc-obs').value.trim()
  });
  e.target.reset();
  renderVacinas();
});

function renderVacinas(){
  const tbody = document.getElementById('tbl-vacinas');
  tbody.innerHTML = vacinas.map(v => {
    const animal = animais.find(a => a.id === v.animalId);
    return `<tr>
      <td>${animal ? animal.idFormatado + (animal.nome ? ' - ' + animal.nome : '') : '(removido)'}</td>
      <td>${v.vacina}</td>
      <td>${fmtData(v.data)}</td>
      <td>${fmtData(v.proxima)}</td>
      <td>${v.obs || '-'}</td>
      <td><button onclick="removerVacina(${v.id})">Remover</button></td>
    </tr>`;
  }).join('');
}

function removerVacina(id){
  vacinas = vacinas.filter(v => v.id !== id);
  renderVacinas();
}

// ABATE POR GRUPO
function gruposAtivos(){
  const ativos = animais.filter(a => a.status === 'Ativo' && a.grupo);
  const grupos = {};
  ativos.forEach(a => {
    grupos[a.grupo] = (grupos[a.grupo] || 0) + 1;
  });
  return grupos;
}

function renderGruposAbate(){
  const sel = document.getElementById('ab-grupo');
  const grupos = gruposAtivos();
  const nomes = Object.keys(grupos);
  sel.innerHTML = nomes.length
    ? nomes.map(g => `<option value="${g}">${g} (${grupos[g]} animais)</option>`).join('')
    : '<option value="">Nenhum grupo com animais ativos</option>';
  atualizarInfoGrupo();
}

function atualizarInfoGrupo(){
  const sel = document.getElementById('ab-grupo');
  const grupos = gruposAtivos();
  const info = document.getElementById('ab-grupo-info');
  const g = sel.value;
  info.textContent = g ? `Este grupo tem ${grupos[g]} animal(is) ativo(s) que serão marcados como abatidos.` : '';
}

document.getElementById('ab-grupo').addEventListener('change', atualizarInfoGrupo);

document.getElementById('form-abate').addEventListener('submit', e => {
  e.preventDefault();
  const grupo = document.getElementById('ab-grupo').value;
  if(!grupo){ alert('Selecione um grupo com animais ativos.'); return; }
  const selecionados = animais.filter(a => a.status === 'Ativo' && a.grupo === grupo);
  if(selecionados.length === 0){ alert('Este grupo não tem animais ativos.'); return; }
  abates.push({
    id: seq++,
    data: document.getElementById('ab-data').value,
    grupo,
    animais: selecionados.map(a => a.idFormatado),
    peso: document.getElementById('ab-peso').value,
    destino: document.getElementById('ab-destino').value.trim()
  });
  selecionados.forEach(a => { a.status = 'Abatido'; });
  e.target.reset();
  renderAnimais();
  renderAbates();
  renderGruposAbate();
});

function renderAbates(){
  const tbody = document.getElementById('tbl-abate');
  tbody.innerHTML = abates.map(ab => `
    <tr>
      <td>${fmtData(ab.data)}</td>
      <td>${ab.grupo}</td>
      <td>${ab.animais.join(', ')} (${ab.animais.length})</td>
      <td>${ab.peso ? ab.peso + ' kg' : '-'}</td>
      <td>${ab.destino || '-'}</td>
      <td><button onclick="removerAbate(${ab.id})">Remover</button></td>
    </tr>`).join('');
}

function removerAbate(id){
  abates = abates.filter(a => a.id !== id);
  renderAbates();
}

// ALIMENTAÇÃO
document.getElementById('form-alimentacao').addEventListener('submit', e => {
  e.preventDefault();
  alimentacoes.push({
    id: seq++,
    data: document.getElementById('al-data').value,
    tipo: document.getElementById('al-tipo').value.trim(),
    qtd: document.getElementById('al-qtd').value,
    grupo: document.getElementById('al-grupo').value.trim(),
    obs: document.getElementById('al-obs').value.trim()
  });
  e.target.reset();
  renderAlimentacoes();
});

function renderAlimentacoes(){
  const tbody = document.getElementById('tbl-alimentacao');
  tbody.innerHTML = alimentacoes.map(al => `
    <tr>
      <td>${fmtData(al.data)}</td>
      <td>${al.tipo}</td>
      <td>${al.qtd} kg</td>
      <td>${al.grupo || '-'}</td>
      <td>${al.obs || '-'}</td>
      <td><button onclick="removerAlimentacao(${al.id})">Remover</button></td>
    </tr>`).join('');
}

function removerAlimentacao(id){
  alimentacoes = alimentacoes.filter(a => a.id !== id);
  renderAlimentacoes();
}

// VISÃO GERAL
function renderVisaoGeral(){
  const ativos = animais.filter(a => a.status === 'Ativo');
  const abatidosTotal = abates.reduce((sum, ab) => sum + ab.animais.length, 0);
  const alimentacaoTotal = alimentacoes.reduce((sum, al) => sum + (parseFloat(al.qtd) || 0), 0);

  document.getElementById('st-animais').textContent = ativos.length;
  document.getElementById('st-vacinas').textContent = vacinas.length;
  document.getElementById('st-abate').textContent = abatidosTotal;
  document.getElementById('st-alimentacao').textContent = alimentacaoTotal;

  document.getElementById('tbl-visao-animais').innerHTML = animais.map(a => `
    <tr>
      <td>${a.idFormatado}</td><td>${a.nome || '-'}</td><td>${a.raca}</td><td>${a.sexo}</td>
      <td>${a.peso ? a.peso + ' kg' : '-'}</td><td>${a.grupo || '-'}</td><td>${a.status}</td>
    </tr>`).join('');

  document.getElementById('tbl-visao-vacinas').innerHTML = vacinas.map(v => {
    const animal = animais.find(a => a.id === v.animalId);
    return `<tr>
      <td>${animal ? animal.idFormatado : '(removido)'}</td><td>${v.vacina}</td>
      <td>${fmtData(v.data)}</td><td>${fmtData(v.proxima)}</td>
    </tr>`;
  }).join('');

  document.getElementById('tbl-visao-abate').innerHTML = abates.map(ab => `
    <tr>
      <td>${fmtData(ab.data)}</td><td>${ab.grupo}</td><td>${ab.animais.join(', ')}</td>
      <td>${ab.peso ? ab.peso + ' kg' : '-'}</td><td>${ab.destino || '-'}</td>
    </tr>`).join('');

  document.getElementById('tbl-visao-alimentacao').innerHTML = alimentacoes.map(al => `
    <tr>
      <td>${fmtData(al.data)}</td><td>${al.tipo}</td><td>${al.qtd} kg</td><td>${al.grupo || '-'}</td>
    </tr>`).join('');
}

renderAnimais();
