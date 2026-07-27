import "./profile.css";

export default function ProfileHome({setPage}){

const username=localStorage.getItem("username");
const email=localStorage.getItem("email");

return(

<div className="profile">

<div className="profileCard">

<div className="avatar">
🎾
</div>

<h2>{username}</h2>

<p>{email}</p>

</div>

<div className="profileMenu">

<button onClick={()=>setPage("edit")}>
✏️ Редактировать профиль
</button>

<button>
🔐 Сменить пароль
</button>

<button onClick={()=>setPage("favorites")}>
⭐ Избранные матчи
</button>

<button>
🧠 История AI
</button>

<button>
💎 Подписка PRO
</button>

<button>
❓ Помощь
</button>

<button>
ℹ️ О приложении
</button>

<button
style={{
background:"#ff4444",
color:"#fff"
}}
onClick={()=>{

localStorage.clear();
window.location.reload();

}}
>
🚪 Выйти
</button>

</div>

</div>

);

}
