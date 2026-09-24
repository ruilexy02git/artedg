/* Arte Digital members area. Configure these values in this file or inject window.ARTEDG_CONFIG before this script. Never put a service_role key here. */
const CONFIG = Object.assign({
  supabaseUrl: 'https://O_SEU_PROJETO.supabase.co',
  supabaseAnonKey: 'A_SUA_CHAVE_ANON_DO_SUPABASE',
  whatsappNumber: '',
  purchaseUrl: '',
  supportMessage: 'Olá, preciso de ajuda com o acesso ao curso Arte Digital.'
}, window.ARTEDG_CONFIG || {});

const configured = CONFIG.supabaseUrl && CONFIG.supabaseAnonKey && window.supabase;
const client = configured ? window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;

const $ = (id) => document.getElementById(id);
let user = null, profile = null, access = null, lessons = [], progress = [], selectedLesson = null, signup = false;

const message = (text, type='') => { const el = $('auth-message'); if(el) el.innerHTML = text ? `<div class="notice ${type}">${text}</div>` : ''; };
const profileMessage = (text, type='') => { const el = $('profile-message'); if(el) el.innerHTML = text ? `<div class="notice ${type}">${text}</div>` : ''; };
const statusLabel = (s) => ({active:'Ativo',pending:'Pendente',expired:'Expirado',none:'Sem acesso'}[s] || 'Sem acesso');

function supportHref(){ return CONFIG.whatsappNumber ? `https://wa.me/${CONFIG.whatsappNumber.replace(/\D/g,'')}?text=${encodeURIComponent(CONFIG.supportMessage)}` : '#'; }
function setupLinks(){ 
  if($('whatsapp'))$('whatsapp').href=supportHref(); 
  if($('support-link'))$('support-link').href=supportHref();
  if($('buy-link'))$('buy-link').href=CONFIG.purchaseUrl || '#'; 
}

function renderNav(){ 
  const nav = $('nav');
  if(nav) nav.innerHTML=user ? `<button data-go="dashboard">Dashboard</button><button data-go="course">Curso</button><button data-go="profile">Meu perfil</button>${profile?.role==='admin'?'<button data-go="admin">Admin</button>':''}<button id="logout">Sair</button>` : ''; 
}

function authMode(){ 
  if(!$('auth-title')) return;
  $('auth-title').textContent = signup ? 'Criar nova conta' : 'Entrar na tua conta';
  $('auth-subtitle').textContent = signup ? 'Insere os teus dados para começar.' : 'Continua a aprender no teu ritmo.'; 
  const nameField = $('name-field');
  const confirmField = $('confirm-field');
  if(nameField) nameField.style.display = signup ? 'block' : 'none';
  if(confirmField) confirmField.style.display = signup ? 'block' : 'none'; 
  const submitBtn = $('auth-submit');
  if(submitBtn) submitBtn.textContent = signup ? 'Registar' : 'Entrar';
  const toggleBtn = $('toggle-auth');
  if(toggleBtn) toggleBtn.textContent = signup ? 'Já tenho conta' : 'Ainda não tenho conta'; 
  const forgotBtn = $('forgot');
  if(forgotBtn) forgotBtn.style.display = signup ? 'none' : 'inline-block'; 
}

async function loadData(){ 
  if(!client||!user)return; 
  const [{data:p},{data:a},{data:l},{data:pr}]=await Promise.all([
    client.from('profiles').select('*').eq('id',user.id).single(),
    client.from('enrollments').select('*').eq('user_id',user.id).maybeSingle(),
    client.from('lessons').select('*,modules(title,courses(title))').order('number'),
    client.from('lesson_progress').select('*').eq('user_id',user.id)
  ]); 
  profile=p; access=a; lessons=l||[]; progress=pr||[]; 
  renderNav(); renderDashboard(); renderCourse(); 
}

function renderDashboard(){ 
  if(!$('user-name')) return;
  $('user-name').textContent=profile?.name||user?.email?.split('@')[0]||'aluno'; 
  const done=progress.filter(x=>x.completed).length, total=lessons.length, pct=total?Math.round(done/total*100):0; 
  $('overall').textContent=pct+'%'; 
  $('overall-bar').style.width=pct+'\%';$('completed').textContent=done; 
  $('remaining').textContent=`${Math.max(total-done,0)} aulas restantes`; 
  $('access-status').textContent=statusLabel(access?.status); 
  const last=lessons.find(l=>l.id===progress.find(x=>x.last_watched)?.lesson_id)||lessons[0]; 
  $('last-lesson').textContent=last?.title||'Ainda não começaste'; 
  $('last-description').textContent=last?.description||'Escolhe uma aula para começar a tua jornada.'; 
  $('continue-btn').onclick=()=>last&&openLesson(last); 
}

function hasAccess(){ return access?.status==='active'; }

function renderCourse(){ 
  const banner=$('access-banner'); 
  if(!banner) return;
  banner.innerHTML=hasAccess()?'':`<div class="notice">Este curso ainda não está disponível para a tua conta. <button class="link-btn" id="open-denied">Ver opções de acesso</button></div>`; 
  $('open-denied')?.addEventListener('click',()=>window.membersNavigate('denied')); 
  
  const list=$('lessons'); 
  if(!list) return;
  list.innerHTML=lessons.length?lessons.map(l=>{
    const p=progress.find(x=>x.lesson_id===l.id);
    return `<article class="card lesson"><div><span class="eyebrow">Aula ${l.number||''}</span><h3>${escapeHtml(l.title)}</h3><p>${escapeHtml(l.description||'')}</p><p class="small muted">${l.duration_minutes||'—'} min · ${p?.completed?'Concluída':'Não iniciada'}</p></div><button class="secondary lesson-open" data-id="${l.id}">${hasAccess()?'Abrir':'Bloqueada'}</button></article>`
  }).join(''):'<div class="card empty"><p class="muted">Nenhuma aula foi configurada ainda. Adicione o conteúdo pelo painel do banco de dados.</p></div>'; 
  
  list.querySelectorAll('.lesson-open').forEach(b=>b.onclick=()=>{
    const l=lessons.find(x=>x.id===b.dataset.id); 
    hasAccess()?openLesson(l):window.membersNavigate('denied');
  }); 
}

function openLesson(l){
  selectedLesson=l; 
  if($('lesson-module'))$('lesson-module').textContent=`Aula ${l.number||''} · ${l.modules?.title||''}`; 
  if($('lesson-title'))$('lesson-title').textContent=l.title; 
  if($('lesson-description'))$('lesson-description').textContent=l.description||'';
  if($('complete-btn'))$('complete-btn').textContent=progress.find(p=>p.lesson_id===l.id)?.completed?'Concluída ✓':'Marcar como concluída'; 
  window.membersNavigate('lesson'); 
}

function escapeHtml(s=''){ return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

async function handleLoginSuccess(userData) {
  window.__ARTE_MEMBER_USER = userData?.email || "user";
  localStorage.setItem("artedg_current_user", userData?.email || "user");
  if (window.membersNavigate) window.membersNavigate("dashboard");
}

function handleLogout() {
  localStorage.removeItem("artedg_current_user");
  delete window.__ARTE_MEMBER_USER;
  if (client?.auth) client.auth.signOut();
  if (window.membersNavigate) window.membersNavigate("auth");
}

function openAccessDenied() {
  if (window.membersNavigate) window.membersNavigate("denied");
}

async function bootstrap(){
  setupLinks();
  authMode(); 
  if(!configured){
    message('A autenticação ainda não está configurada. Preencha supabaseUrl e supabaseAnonKey em members.js conforme a documentação.','error');
    return;
  } 
  const {data}=await client.auth.getSession(); 
  user=data.session?.user||null; 
  if(user){
    await loadData();
    if(window.membersNavigate && window.location.hash === "#/membros/login") window.membersNavigate('dashboard');
  } 
  client.auth.onAuthStateChange(async(_,session)=>{
    user=session?.user||null; 
    if(user){
      await loadData();
      if(window.membersNavigate) window.membersNavigate('dashboard');
    } else {
      profile=null; access=null; renderNav();
      if(window.membersNavigate) window.membersNavigate('auth');
    }
  });
}

const authForm = $('auth-form');
if(authForm) {
  authForm.onsubmit = async(e) => {
    e.preventDefault(); 
    if(!client)return; 
    message(''); 
    const email=$('email').value.trim(), password=$('password').value; 
    if(signup){
      if(password!==$('confirm').value)return message('As senhas não coincidem.','error');
      const {error}=await client.auth.signUp({email,password,options:{data:{name:$('name').value.trim()}}});
      if(error)return message(error.message,'error');
      message('Conta criada. Verifica o teu e-mail para confirmar o cadastro.','success');
    }else{
      const {error, data}=await client.auth.signInWithPassword({email,password});
      if(error) {
        message('E-mail ou senha inválidos.','error');
      } else if (data?.user) {
        handleLoginSuccess(data.user);
      }
    }
  };
}

const toggleAuthBtn = $('toggle-auth');
if(toggleAuthBtn) {
  toggleAuthBtn.onclick = () => { 
    signup = !signup; 
    authMode(); 
    message(''); 
  };
}

const forgotBtn = $('forgot');
if(forgotBtn) {
  forgotBtn.onclick = async() => {
    if(!client)return;
    const email=$('email').value.trim();
    if(!email)return message('Indica o teu e-mail primeiro.','error');
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.href});
    message(error?error.message:'Enviámos as instruções de recuperação para o teu e-mail.',error?'error':'success');
  };
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]');
  if(!b)return;
  if(!user) {
    if(window.membersNavigate) window.membersNavigate('auth');
    return;
  }
  const target=b.dataset.go;
  if(target==='admin'&&profile?.role!=='admin') {
    if(window.membersNavigate) window.membersNavigate('denied');
    return;
  }
});

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'logout') {
    handleLogout();
  }
});

const profileForm = $('profile-form');
if(profileForm) {
  profileForm.onsubmit = async(e) => {
    e.preventDefault();
    const {error}=await client.from('profiles').update({name:$('profile-name').value.trim(),avatar_url:$('profile-avatar').value.trim()||null}).eq('id',user.id);
    profileMessage(error?.message||'Dados atualizados.','success');
    if(!error) loadData();
  };
}

const passwordForm = $('password-form');
if(passwordForm) {
  passwordForm.onsubmit = async(e) => {
    e.preventDefault();
    const {error}=await client.auth.updateUser({password:$('new-password').value});
    profileMessage(error?.message||'Senha atualizada.','success');
  };
}

const completeBtn = $('complete-btn');
if(completeBtn) {
  completeBtn.onclick = async() => {
    if(!selectedLesson||!client)return;
    const {error}=await client.from('lesson_progress').upsert({user_id:user.id,lesson_id:selectedLesson.id,completed:true,completed_at:new Date().toISOString(),last_watched:true},{onConflict:'user_id,lesson_id'});
    if(!error){await loadData();openLesson(selectedLesson);}
  };
}

const observer=new MutationObserver(()=>{
  if($('profile-view')?.classList.contains('active')&&profile){
    if($('profile-name'))$('profile-name').value=profile.name||'';
    if($('profile-email'))$('profile-email').value=user.email;
    if($('profile-avatar'))$('profile-avatar').value=profile.avatar_url||'';
    if($('created-at'))$('created-at').textContent=profile.created_at?`Conta criada em ${new Date(profile.created_at).toLocaleDateString('pt-PT')}`:'';
  }
});
observer.observe(document.body,{attributes:true,subtree:true});

bootstrap();
