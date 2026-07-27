import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav(){

const navigate = useNavigate();
const location = useLocation();

const isActive=(path)=>location.pathname===path;

return(

<div className="bottomNav">

<div
className={`navItem ${isActive("/")?"active":""}`}
onClick={()=>navigate("/")}
>
<div className="navIcon">🏠</div>
<div className="navText">Главная</div>
</div>

<div
className={`navItem ${isActive("/matches")?"active":""}`}
onClick={()=>navigate("/matches")}
>
<div className="navIcon">🎾</div>
<div className="navText">Матчи</div>
</div>

<div
className={`navItem ${isActive("/analytics")?"active":""}`}
onClick={()=>navigate("/analytics")}
>
<div className="navIcon">📊</div>
<div className="navText">Аналитика</div>
</div>

<div
className={`navItem ${isActive("/favorites")?"active":""}`}
onClick={()=>navigate("/favorites")}
>
<div className="navIcon">⭐</div>
<div className="navText">Избранное</div>
</div>

<div
className={`navItem ${isActive("/profile")?"active":""}`}
onClick={()=>navigate("/profile")}
>
<div className="navIcon">👤</div>
<div className="navText">Профиль</div>
</div>

</div>

);

}
