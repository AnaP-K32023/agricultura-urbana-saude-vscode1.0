/* Filtros da página de listagem de hortas */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-filter-group="hortas"]');
  if (!container) return;

  const botoes = container.querySelectorAll('.filter-btn');
  const itens = document.querySelectorAll('.horta-item');

  function filtrarHortas(filtro) {
    itens.forEach((item) => {
      const status = item.dataset.status;
      const regiao = item.dataset.regiao;

      const mostrar =
        filtro === 'todos' ||
        (filtro === 'ativas' && status === 'true') ||
        (filtro === 'inativas' && status === 'false') ||
        filtro === regiao;

      item.hidden = !mostrar;
    });
  }

  botoes.forEach((botao) => {
    botao.addEventListener('click', () => {
      botoes.forEach((btn) => btn.classList.remove('active'));
      botao.classList.add('active');
      filtrarHortas(botao.dataset.filter);
    });
  });
});
