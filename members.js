const CONFIG = Object.assign({
  supabaseUrl: 'COLOQUE_AQUI_A_URL_DO_SUPABASE',
  supabaseAnonKey: 'COLOQUE_AQUI_A_CHAVE_ANON_DO_SUPABASE',
  whatsappNumber: '',
  purchaseUrl: '',
  supportMessage: 'Olá, preciso de ajuda com o acesso ao curso Arte Digital.'
}, window.ARTEDG_CONFIG || {});
// Alternar entre modo de Login e Registo
const toggleAuthBtn = document.getElementById('toggle-auth');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmit = document.getElementById('auth-submit');
const nameField = document.getElementById('name-field');
const confirmField = document.getElementById('confirm-field');

let isRegistering = false;

if (toggleAuthBtn) {
  toggleAuthBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    if (isRegistering) {
      authTitle.textContent = 'Criar nova conta';
      authSubtitle.textContent = 'Insere os teus dados para começar.';
      authSubmit.textContent = 'Registar';
      toggleAuthBtn.textContent = 'Já tenho conta';
      if (nameField) nameField.style.display = 'block';
      if (confirmField) confirmField.style.display = 'block';
    } else {
      authTitle.textContent = 'Entrar na tua conta';
      authSubtitle.textContent = 'Continua a aprender no teu ritmo.';
      authSubmit.textContent = 'Entrar';
      toggleAuthBtn.textContent = 'Ainda não tenho conta';
      if (nameField) nameField.style.display = 'none';
      if (confirmField) nameField.style.display = 'none';
    }
  });
}
