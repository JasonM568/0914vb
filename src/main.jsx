import React, {useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {LayoutDashboard, Inbox, FolderKanban, Search, Plus, CalendarDays, CheckCircle2, Clock3, AlertCircle, MoreHorizontal, Settings, Sparkles, ChevronDown, X, Circle} from 'lucide-react';
import './styles.css';

const today = new Date();
const iso = (d) => new Date(d).toISOString().slice(0,10);
const fmt = (value) => value ? new Intl.DateTimeFormat('zh-TW',{month:'short',day:'numeric'}).format(new Date(value+'T00:00:00')) : '無期限';
const uid = () => Math.random().toString(36).slice(2,10);

const initial = {
  projects:[
    {id:'inbox',name:'收件匣',description:'還沒分類的快速筆記',status:'active',dueDate:'',color:'#8b7cf6',isInbox:true},
    {id:'site',name:'網站改版',description:'讓品牌網站更清楚、更好用',status:'active',dueDate:'2026-09-30',color:'#54c6a8'},
    {id:'content',name:'內容系統',description:'建立可持續的內容生產流程',status:'active',dueDate:'2026-10-15',color:'#f6b55d'},
    {id:'home',name:'生活整理',description:'讓日常有更多餘裕',status:'not_started',dueDate:'',color:'#ee8c9a'}
  ],
  tasks:[
    {id:'t1',projectId:'site',title:'整理首頁資訊架構',description:'把訪客最需要知道的三件事排出來',status:'in_progress',priority:'high',dueAt:'2026-09-14',focus:true,blocked:false,tags:['策略'],parentId:null},
    {id:'t2',projectId:'site',title:'確認手機版導覽選單',description:'',status:'todo',priority:'normal',dueAt:'2026-09-15',focus:true,blocked:false,tags:['設計'],parentId:null},
    {id:'t3',projectId:'content',title:'完成電子報第 12 期',description:'',status:'todo',priority:'critical',dueAt:'2026-09-13',focus:false,blocked:false,tags:['內容'],parentId:null},
    {id:'t4',projectId:'content',title:'整理素材資料夾',description:'',status:'completed',priority:'low',dueAt:'2026-09-12',focus:false,blocked:false,tags:['整理'],parentId:null},
    {id:'t5',projectId:'inbox',title:'詢問客戶下週會議時間',description:'',status:'todo',priority:'high',dueAt:'',focus:false,blocked:false,tags:['等待'],parentId:null},
    {id:'t6',projectId:'home',title:'預約年度健康檢查',description:'',status:'todo',priority:'normal',dueAt:'2026-09-20',focus:false,blocked:false,tags:['生活'],parentId:null}
  ]
};

function load(){try{return JSON.parse(localStorage.getItem('focusflow-data'))||initial}catch{return initial}}
function save(data){localStorage.setItem('focusflow-data',JSON.stringify(data))}
const priorityLabel={critical:'關鍵',high:'高',normal:'一般',low:'低'};
const statusLabel={todo:'待處理',in_progress:'進行中',blocked:'阻塞',completed:'已完成',cancelled:'已取消'};
const statusOrder=['todo','in_progress','blocked','completed'];

function App(){
  const [data,setData]=useState(load); const [view,setView]=useState('today'); const [selectedProject,setSelectedProject]=useState(null); const [query,setQuery]=useState(''); const [modal,setModal]=useState(null); const [filter,setFilter]=useState('all');
  const update=(next)=>{setData(next);save(next)};
  const projects=data.projects; const tasks=data.tasks;
  const projectById=(id)=>projects.find(p=>p.id===id)||projects[0];
  const openProject=(id)=>{setSelectedProject(id);setView('project')};
  const searchResults=useMemo(()=>tasks.filter(t=>`${t.title} ${t.description} ${t.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())),[tasks,query]);
  const todayTasks=tasks.filter(t=>t.status!=='completed'&&t.status!=='cancelled');
  const overdue=tasks.filter(t=>t.dueAt&&t.dueAt<iso(today)&&t.status!=='completed'&&t.status!=='cancelled');
  const dueToday=tasks.filter(t=>t.dueAt===iso(today)&&t.status!=='completed'&&t.status!=='cancelled');
  const upcoming=tasks.filter(t=>t.dueAt&&t.dueAt>iso(today)&&t.dueAt<=iso(new Date(today.getTime()+7*86400000))&&t.status!=='completed'&&t.status!=='cancelled');
  const focus=tasks.filter(t=>t.focus&&t.status!=='completed'&&t.status!=='cancelled');
  const displayed=filter==='overdue'?overdue:filter==='today'?dueToday:filter==='focus'?focus:filter==='upcoming'?upcoming:searchResults;
  const stats={active:tasks.filter(t=>t.status==='in_progress').length, done:tasks.filter(t=>t.status==='completed').length, overdue:overdue.length};
  const addTask=(form)=>{const next={...data,tasks:[...tasks,{id:uid(),projectId:form.projectId||'inbox',title:form.title,description:'',status:'todo',priority:form.priority||'normal',dueAt:form.dueAt||'',focus:false,blocked:false,tags:[],parentId:null}]};update(next);setModal(null)};
  const addProject=(form)=>{update({...data,projects:[...projects,{id:uid(),name:form.name,description:form.description,status:'not_started',dueDate:form.dueDate||'',color:form.color||'#8b7cf6',isInbox:false}]});setModal(null)};
  const changeStatus=(id,status)=>update({...data,tasks:tasks.map(t=>t.id===id?{...t,status,blocked:status==='blocked',completedAt:status==='completed'?new Date().toISOString():null}:t)});
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">✦</div><div><strong>FocusFlow</strong><span>WORK OS</span></div></div>
      <button className="quick-add" onClick={()=>setModal('task')}><Plus size={18}/>快速新增任務</button>
      <nav><Nav icon={<LayoutDashboard/>} label="今日首頁" active={view==='today'} onClick={()=>setView('today')}/><Nav icon={<Inbox/>} label="收件匣" active={view==='inbox'} badge={tasks.filter(t=>t.projectId==='inbox'&&t.status!=='completed').length} onClick={()=>setView('inbox')}/><Nav icon={<Search/>} label="所有任務" active={view==='all'} onClick={()=>setView('all')}/></nav>
      <div className="side-section"><div className="side-heading"><span>我的專案</span><button onClick={()=>setModal('project')}><Plus size={15}/></button></div>{projects.filter(p=>!p.isInbox).map(p=><button className={`project-link ${selectedProject===p.id&&view==='project'?'selected':''}`} key={p.id} onClick={()=>openProject(p.id)}><i style={{background:p.color}}></i><span>{p.name}</span><em>{tasks.filter(t=>t.projectId===p.id&&t.status!=='completed').length}</em></button>)}</div>
      <div className="sidebar-bottom"><button className="nav-item"><Settings size={18}/>設定</button><div className="user-card"><div className="avatar">JM</div><div><strong>Jason Chen</strong><span>個人工作區</span></div><MoreHorizontal size={17}/></div></div>
    </aside>
    <main className="main"><header className="topbar"><div className="breadcrumbs">工作區 <span>/</span> {view==='project'?projectById(selectedProject)?.name:view==='today'?'今日首頁':view==='inbox'?'收件匣':'所有任務'}</div><div className="top-actions"><div className="search-box"><Search size={17}/><input placeholder="搜尋任務、專案..." value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')}><X size={15}/></button>}</div><button className="icon-button"><Sparkles size={18}/></button><div className="mini-avatar">JM</div></div></header>
      {view==='today'&&<Today focus={focus} overdue={overdue} dueToday={dueToday} upcoming={upcoming} stats={stats} onAdd={()=>setModal('task')} onStatus={changeStatus} onFilter={(nextFilter)=>{setFilter(nextFilter);setView('all')}} displayed={displayed}/>} 
      {view==='project'&&<ProjectView project={projectById(selectedProject)} tasks={tasks.filter(t=>t.projectId===selectedProject)} onAdd={()=>setModal('task')} onStatus={changeStatus} />}
      {view==='inbox'&&<TaskCollection title="收件匣" subtitle="先記下來，稍後再整理" tasks={tasks.filter(t=>t.projectId==='inbox')} onAdd={()=>setModal('task')} onStatus={changeStatus} projects={projects}/>} 
      {view==='all'&&<TaskCollection title="所有任務" subtitle="跨專案查看你的全部工作" tasks={displayed} onAdd={()=>setModal('task')} onStatus={changeStatus} projects={projects}/>} 
    </main>
    {modal==='task'&&<Modal title="新增任務" onClose={()=>setModal(null)}><TaskForm projects={projects} onSubmit={addTask}/></Modal>}{modal==='project'&&<Modal title="建立專案" onClose={()=>setModal(null)}><ProjectForm onSubmit={addProject}/></Modal>}
  </div>
}
function Nav({icon,label,active,badge,onClick}){return <button className={`nav-item ${active?'active':''}`} onClick={onClick}>{icon}<span>{label}</span>{badge>0&&<b>{badge}</b>}</button>}
function Today({focus,overdue,dueToday,upcoming,stats,onAdd,onStatus,onFilter,displayed}){return <div className="content"><div className="page-head"><div><div className="eyebrow">星期一，2026 年 9 月 14 日</div><h1>早安，Jason <span>👋</span></h1><p>今天也有清楚的一步，從最重要的事開始。</p></div><button className="primary" onClick={onAdd}><Plus size={18}/>新增任務</button></div><div className="stat-row"><Stat icon={<Circle/>} value={stats.active} label="進行中" tone="purple"/><Stat icon={<CheckCircle2/>} value={stats.done} label="已完成" tone="green"/><Stat icon={<AlertCircle/>} value={stats.overdue} label="逾期" tone="orange"/></div><div className="today-grid"><section className="main-column"><TaskSection title="今日焦點" count={focus.length} accent="purple" tasks={focus} onStatus={onStatus} empty="挑一件今天最重要的事吧"/><TaskSection title="今天到期" count={dueToday.length} accent="orange" tasks={dueToday} onStatus={onStatus} empty="今天沒有到期任務"/><TaskSection title="即將到期" count={upcoming.length} accent="blue" tasks={upcoming} onStatus={onStatus} empty="接下來七天很從容"/></section><aside className="right-column"><div className="quote-card"><div className="quote-mark">“</div><p>一次只做一件事，<br/>把注意力放回當下。</p><span>今日提醒</span></div><div className="mini-card"><div className="card-title">快速檢視 <MoreHorizontal size={16}/></div><button onClick={()=>onFilter('overdue')}><AlertCircle size={17}/><span>逾期任務</span><b>{overdue.length}</b></button><button onClick={()=>onFilter('focus')}><Sparkles size={17}/><span>今日焦點</span><b>{focus.length}</b></button><button onClick={()=>onFilter('upcoming')}><Clock3 size={17}/><span>七日內到期</span><b>{upcoming.length}</b></button></div></aside></div></div>}
function Stat({icon,value,label,tone}){return <div className={`stat ${tone}`}><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div></div>}
function TaskSection({title,count,accent,tasks,onStatus,empty}){return <section className="task-section"><div className="section-head"><div><i className={accent}></i><h2>{title}</h2><span className="count">{count}</span></div><button>查看全部 <ChevronDown size={14}/></button></div>{tasks.length?tasks.map(t=><TaskRow task={t} key={t.id} onStatus={onStatus}/>):<div className="empty">{empty}</div>}</section>}
function TaskRow({task,onStatus,projects}){return <div className="task-row"><button className={`check ${task.status==='completed'?'checked':''}`} onClick={()=>onStatus(task.id,task.status==='completed'?'todo':'completed')}>{task.status==='completed'?<CheckCircle2 size={19}/>:<Circle size={19}/>}</button><div className="task-copy"><strong>{task.title}</strong>{task.description&&<span>{task.description}</span>}<div className="task-meta">{task.tags.map(tag=><em key={tag}>{tag}</em>)}{task.dueAt&&<span className={task.dueAt<iso(today)&&task.status!=='completed'?'late':''}><CalendarDays size={13}/>{fmt(task.dueAt)}</span>}</div></div><span className={`priority ${task.priority}`}>{priorityLabel[task.priority]}</span><button className="row-more"><MoreHorizontal size={17}/></button></div>}
function ProjectView({project,tasks,onAdd,onStatus}){const [board,setBoard]=useState(true);return <div className="content"><div className="page-head project-head"><div><div className="eyebrow"><span className="color-dot" style={{background:project.color}}/>專案</div><h1>{project.name}</h1><p>{project.description}</p></div><button className="primary" onClick={onAdd}><Plus size={18}/>新增任務</button></div><div className="project-toolbar"><div className="progress-wrap"><span>專案進度</span><div className="progress"><i style={{width:`${progress(tasks)}%`}}/></div><strong>{progress(tasks)}%</strong></div><div className="view-switch"><button className={!board?'selected':''} onClick={()=>setBoard(false)}>清單</button><button className={board?'selected':''} onClick={()=>setBoard(true)}>Kanban</button></div></div>{board?<div className="board">{statusOrder.map(status=><div className="board-column" key={status}><div className="column-title"><span>{statusLabel[status]}</span><b>{tasks.filter(t=>t.status===status).length}</b></div><div className="drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{const id=e.dataTransfer.getData('task');onStatus(id,status)}}>{tasks.filter(t=>t.status===status).map(t=><div className="board-card" draggable onDragStart={e=>e.dataTransfer.setData('task',t.id)} key={t.id}><div className="board-card-top"><span className={`priority-dot ${t.priority}`}/><span>{project.name}</span><MoreHorizontal size={15}/></div><strong>{t.title}</strong>{t.description&&<p>{t.description}</p>}<div className="board-card-foot"><span className={`priority ${t.priority}`}>{priorityLabel[t.priority]}</span>{t.dueAt&&<small><CalendarDays size={13}/>{fmt(t.dueAt)}</small>}</div></div>)}</div></div>)}</div>:<div className="task-list">{tasks.map(t=><TaskRow task={t} key={t.id} onStatus={onStatus}/>)}</div>}</div>}
function progress(tasks){const parents=tasks.filter(t=>!t.parentId);if(!parents.length)return 0;return Math.round(parents.filter(t=>t.status==='completed').length/parents.length*100)}
function TaskCollection({title,subtitle,tasks,onAdd,onStatus}){return <div className="content"><div className="page-head"><div><div className="eyebrow">任務管理</div><h1>{title}</h1><p>{subtitle}</p></div><button className="primary" onClick={onAdd}><Plus size={18}/>新增任務</button></div><div className="collection-toolbar"><span>{tasks.length} 項任務</span><button>篩選 <ChevronDown size={14}/></button><button>排序 <ChevronDown size={14}/></button></div><div className="task-list">{tasks.length?tasks.map(t=><TaskRow task={t} key={t.id} onStatus={onStatus}/>):<div className="empty large">目前沒有符合條件的任務</div>}</div></div>}
function Modal({title,onClose,children}){return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={18}/></button></div>{children}</div></div>}
function TaskForm({projects,onSubmit}){const [title,setTitle]=useState('');const [projectId,setProjectId]=useState('inbox');const [priority,setPriority]=useState('normal');const [dueAt,setDueAt]=useState('');return <form onSubmit={e=>{e.preventDefault();if(title.trim())onSubmit({title:title.trim(),projectId,priority,dueAt})}}><label>任務名稱<input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：準備明天的會議資料"/></label><div className="form-grid"><label>所屬專案<select value={projectId} onChange={e=>setProjectId(e.target.value)}>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>優先級<select value={priority} onChange={e=>setPriority(e.target.value)}>{Object.entries(priorityLabel).map(([k,v])=><option value={k} key={k}>{v}</option>)}</select></label></div><label>截止日期<input type="date" value={dueAt} onChange={e=>setDueAt(e.target.value)}/></label><button className="primary form-submit">建立任務</button></form>}
function ProjectForm({onSubmit}){const [name,setName]=useState('');const [description,setDescription]=useState('');const [dueDate,setDueDate]=useState('');return <form onSubmit={e=>{e.preventDefault();if(name.trim())onSubmit({name:name.trim(),description,dueDate})}}><label>專案名稱<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例如：Q4 行銷計畫"/></label><label>簡短描述<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="這個專案想完成什麼？" rows="3"/></label><label>專案截止日期<input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label><button className="primary form-submit">建立專案</button></form>}

createRoot(document.getElementById('root')).render(<App/>);
