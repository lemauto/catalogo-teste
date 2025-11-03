// ===================== ELEMENTOS PRINCIPAIS =====================
const enviarBtn = document.getElementById('enviar');
const arquivoInput = document.getElementById('arquivo');
const codigoInput = document.getElementById('codigo');
const descricaoInput = document.getElementById('descricao');
const galeria = document.getElementById('galeria');

const modal = document.getElementById('modal');
const modalContent = modal.querySelector('.modal-content');
const fecharModal = modal.querySelector('.fechar');
const descricaoModal = modal.querySelector('.descricao-modal');
const indicadoresDiv = modal.querySelector('.indicadores');
const setaEsquerda = modal.querySelector('.seta.esquerda');
const setaDireita = modal.querySelector('.seta.direita');

let indiceAtual = 0;
let intervalo;

// ===================== FUNÇÃO: SALVAR GALERIA =====================
function salvarGaleria() {
  const cards = Array.from(galeria.children);
  const dados = cards.map(card => {
    const codigo = card.querySelector('.label').textContent;
    const descricao = card.querySelector('.descricao').textContent;
    const medias = Array.from(card.querySelectorAll('img, video')).map(m => ({
      url: m.src,
      type: m.tagName.toLowerCase() === 'img' ? 'image' : 'video'
    }));
    return { codigo, descricao, medias };
  });
  localStorage.setItem('galeria', JSON.stringify(dados));
}

// ===================== FUNÇÃO: CARREGAR GALERIA =====================
function carregarGaleria() {
  const dados = JSON.parse(localStorage.getItem('galeria') || '[]');
  dados.forEach(d => galeria.appendChild(criarCard(d.codigo, d.descricao, d.medias)));
}

// ===================== FUNÇÃO: CRIAR CARD =====================
function criarCard(codigo, descricao, medias) {
  const container = document.createElement('div');
  container.className = 'card';

  // Primeira mídia como capa
  const capa = document.createElement('img');
  capa.src = medias[0].url;
  container.appendChild(capa);

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = codigo;

  const descricaoBox = document.createElement('div');
  descricaoBox.className = 'descricao';
  descricaoBox.textContent = descricao;

  // Botões editar e excluir
  const botoes = document.createElement('div');
  botoes.className = 'botoes';
  const editarBtn = document.createElement('button');
  editarBtn.textContent = '✏️ Editar';
  const excluirBtn = document.createElement('button');
  excluirBtn.textContent = '🗑️ Excluir';
  botoes.append(editarBtn, excluirBtn);

  container.append(label, descricaoBox, botoes);

  // ===== Editar card inline =====
  editarBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (container.querySelector('.editar-box')) return;

    const editarBox = document.createElement('div');
    editarBox.className = 'editar-box';
    editarBox.addEventListener('click', e => e.stopPropagation());

    const inputCodigo = document.createElement('input');
    inputCodigo.value = codigo;
    const inputDescricao = document.createElement('textarea');
    inputDescricao.value = descricao;

    const salvarBtn = document.createElement('button');
    salvarBtn.textContent = 'Salvar';
    const cancelarBtn = document.createElement('button');
    cancelarBtn.textContent = 'Cancelar';
    cancelarBtn.style.background = '#999';

    [inputCodigo, inputDescricao, salvarBtn, cancelarBtn].forEach(el => {
      el.addEventListener('click', e => e.stopPropagation());
    });

    salvarBtn.addEventListener('click', () => {
      codigo = inputCodigo.value.trim() || codigo;
      descricao = inputDescricao.value.trim();
      label.textContent = codigo;
      descricaoBox.textContent = descricao;
      editarBox.remove();
      salvarGaleria();
    });

    cancelarBtn.addEventListener('click', () => editarBox.remove());

    editarBox.append(inputCodigo, inputDescricao, salvarBtn, cancelarBtn);
    container.appendChild(editarBox);
  });

  // ===== Excluir card =====
  excluirBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este item?')) {
      container.remove();
      salvarGaleria();
    }
  });

  // ===== Abrir modal =====
  container.addEventListener('click', (e) => {
    const editarBox = container.querySelector('.editar-box');
    if (editarBox && editarBox.contains(e.target)) return;
    abrirModal(medias, codigo, descricao);
  });

  return container;
}

// ===================== FUNÇÃO: ABRIR MODAL =====================
function abrirModal(medias, codigo, descricao) {
  modal.style.display = 'flex';
  descricaoModal.textContent = descricao;
  indicadoresDiv.innerHTML = '';
  modalContent.querySelectorAll('img, video').forEach(el => el.remove());

  medias.forEach((m, i) => {
    const el = m.type === 'image' ? document.createElement('img') : document.createElement('video');
    el.src = m.url;
    if (m.type === 'video') el.controls = true;
    modalContent.insertBefore(el, descricaoModal);

    const indicador = document.createElement('div');
    indicador.className = 'indicador';
    indicador.addEventListener('click', () => mostrarSlide(i));
    indicadoresDiv.appendChild(indicador);
  });

  // Código + descrição no modal
  const codigoModal = document.createElement('div');
  codigoModal.style.color = 'white';
  codigoModal.style.fontWeight = 'bold';
  codigoModal.style.marginTop = '10px';
  codigoModal.textContent = `Código: ${codigo}`;
  modalContent.insertBefore(codigoModal, descricaoModal);

  indiceAtual = 0;
  mostrarSlide(indiceAtual);
  intervalo = setInterval(() => mudarSlide(1), 15000);
}

// ===================== FUNÇÃO: CONTROLE DO SLIDE =====================
function mostrarSlide(index) {
  const slides = modalContent.querySelectorAll('img, video');
  const indicadores = indicadoresDiv.querySelectorAll('.indicador');

  if (index >= slides.length) indiceAtual = 0;
  if (index < 0) indiceAtual = slides.length - 1;

  slides.forEach(s => s.style.display = 'none');
  indicadores.forEach(i => i.classList.remove('ativo'));

  if(slides[indiceAtual]) slides[indiceAtual].style.display = 'block';
  if(indicadores[indiceAtual]) indicadores[indiceAtual].classList.add('ativo');
}

function mudarSlide(n) { indiceAtual += n; mostrarSlide(indiceAtual); }

// ===================== EVENTOS DO MODAL =====================
fecharModal.addEventListener('click', () => {
  modal.style.display = 'none';
  clearInterval(intervalo);
});
setaEsquerda.addEventListener('click', () => mudarSlide(-1));
setaDireita.addEventListener('click', () => mudarSlide(1));

// ===================== FUNÇÃO: CADASTRAR NOVA PEÇA =====================
enviarBtn.addEventListener('click', () => {
  const arquivos = Array.from(arquivoInput.files);
  const codigo = codigoInput.value.trim();
  const descricao = descricaoInput.value.trim();

  if (!codigo) return alert('Digite o código da peça!');
  if (arquivos.length === 0) return alert('Escolha pelo menos uma foto ou vídeo!');

  const medias = [];
  let carregadas = 0;

  arquivos.forEach(arquivo => {
    const reader = new FileReader();
    reader.onload = e => {
      medias.push({ url: e.target.result, type: arquivo.type.startsWith('image') ? 'image' : 'video' });
      carregadas++;
      if (carregadas === arquivos.length) {
        galeria.appendChild(criarCard(codigo, descricao, medias));
        salvarGaleria();
      }
    };
    reader.readAsDataURL(arquivo);
  });

  codigoInput.value = '';
  descricaoInput.value = '';
  arquivoInput.value = '';
});

// ===================== INICIALIZAÇÃO =====================
carregarGaleria();