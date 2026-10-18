// Study Planner - JavaScript
"use strict";
const taskForm=document.getElementById("taskForm");
const taskTitle=document.getElementById("taskTitle");
const taskSubject=document.getElementById("taskSubject");
const taskDate=document.getElementById("taskDate");
const taskPriority=document.getElementById("taskPriority");
const taskNotes=document.getElementById("taskNotes");
const submitButton=document.getElementById("submitButton");
const cancelEdit=document.getElementById("cancelEdit");
const taskList=document.getElementById("taskList");
const emptyState=document.getElementById("emptyState");
const searchTasks=document.getElementById("searchTasks");
const filterStatus=document.getElementById("filterStatus");
const sortTasks=document.getElementById("sortTasks");
let tasks=loadTasks();
let editingId=null;
document.getElementById("currentYear").textContent=new Date().getFullYear();

function loadTasks(){try{const value=JSON.parse(localStorage.getItem("studyPlannerTasks")||"[]");return Array.isArray(value)?value:[];}catch{return [];}}
function saveTasks(){localStorage.setItem("studyPlannerTasks",JSON.stringify(tasks));}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function dateLabel(value){if(!value)return "No deadline";const d=new Date(value+"T00:00:00");return Number.isNaN(d.getTime())?value:d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
function newId(){return window.crypto&&crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;}

taskForm.addEventListener("submit",function(event){
 event.preventDefault();
 const title=taskTitle.value.trim(),subject=taskSubject.value.trim(),deadline=taskDate.value;
 if(!title||!subject||!deadline){alert("Please fill in the task name, subject, and deadline.");return;}
 const fields={title,subject,deadline,priority:taskPriority.value,notes:taskNotes.value.trim()};
 if(editingId){tasks=tasks.map(t=>t.id===editingId?{...t,...fields}:t);}
 else{tasks.push({id:newId(),...fields,completed:false,createdAt:new Date().toISOString()});}
 saveTasks();resetForm();renderTasks();
});
function resetForm(){taskForm.reset();editingId=null;submitButton.textContent="+ Add Task";cancelEdit.hidden=true;}
cancelEdit.addEventListener("click",resetForm);

function renderTasks(){
 const query=searchTasks.value.trim().toLowerCase(),status=filterStatus.value,sort=sortTasks.value;
 let shown=tasks.filter(t=>`${t.title} ${t.subject} ${t.notes||""}`.toLowerCase().includes(query)&&
 (status==="All"||(status==="Pending"&&!t.completed)||(status==="Completed"&&t.completed)));
 if(sort==="date")shown.sort((a,b)=>a.deadline.localeCompare(b.deadline));
 if(sort==="priority"){const rank={High:1,Medium:2,Low:3};shown.sort((a,b)=>rank[a.priority]-rank[b.priority]);}
 if(sort==="newest")shown.sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
 taskList.replaceChildren();shown.forEach(t=>taskList.appendChild(createCard(t)));
 emptyState.hidden=shown.length!==0;
 document.getElementById("taskCount").textContent=`${shown.length} ${shown.length===1?"task":"tasks"}`;
 const done=tasks.filter(t=>t.completed).length;
 document.getElementById("totalTasks").textContent=tasks.length;
 document.getElementById("pendingTasks").textContent=tasks.length-done;
 document.getElementById("completedTasks").textContent=done;
 document.getElementById("dueToday").textContent=tasks.filter(t=>!t.completed&&t.deadline===today()).length;
}
function createCard(task){
 const card=document.createElement("article");card.className="task-card";if(task.completed)card.classList.add("is-completed");
 const main=document.createElement("div");main.className="task-main";
 const check=document.createElement("input");check.type="checkbox";check.className="task-checkbox";check.checked=Boolean(task.completed);check.setAttribute("aria-label",`Mark ${task.title} completed`);
 check.addEventListener("change",()=>{tasks=tasks.map(t=>t.id===task.id?{...t,completed:check.checked}:t);saveTasks();renderTasks();});
 const content=document.createElement("div");content.className="task-content";
 const title=document.createElement("h3");title.textContent=task.title;
 const subject=document.createElement("p");subject.textContent="Subject: "+task.subject;
 const deadline=document.createElement("p");deadline.textContent="Deadline: "+dateLabel(task.deadline);
 if(!task.completed&&task.deadline<today()){deadline.classList.add("overdue");deadline.textContent+=" (Overdue)";}
 content.append(title,subject,deadline);
 if(task.notes){const note=document.createElement("p");note.textContent="Notes: "+task.notes;content.appendChild(note);}
 const badges=document.createElement("div");const priority=document.createElement("span");priority.className="badge priority-"+task.priority;priority.textContent=task.priority+" Priority";
 const state=document.createElement("span");state.className="badge";state.textContent=task.completed?"Completed":"Pending";badges.append(priority,state);content.appendChild(badges);main.append(check,content);
 const actions=document.createElement("div");actions.className="task-actions";
 const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";edit.addEventListener("click",()=>editTask(task.id));
 const del=document.createElement("button");del.type="button";del.className="delete";del.textContent="Delete";del.addEventListener("click",()=>{if(!confirm("Delete this task?"))return;tasks=tasks.filter(t=>t.id!==task.id);if(editingId===task.id)resetForm();saveTasks();renderTasks();});
 actions.append(edit,del);card.append(main,actions);return card;
}
function editTask(id){const t=tasks.find(item=>item.id===id);if(!t)return;editingId=id;taskTitle.value=t.title;taskSubject.value=t.subject;taskDate.value=t.deadline;taskPriority.value=t.priority;taskNotes.value=t.notes||"";submitButton.textContent="Save Changes";cancelEdit.hidden=false;document.getElementById("add-task").scrollIntoView({behavior:"smooth"});taskTitle.focus();}
searchTasks.addEventListener("input",renderTasks);filterStatus.addEventListener("change",renderTasks);sortTasks.addEventListener("change",renderTasks);
renderTasks();