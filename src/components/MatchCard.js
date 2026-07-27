import { useNavigate } from "react-router-dom";

export default function MatchCard(){

const navigate = useNavigate();

return(

<div
className="matchCard"
onClick={()=>navigate("/match")}
style={{cursor:"pointer"}}
>

<div className="matchHeader">

MATCH OF THE DAY

</div>

<div className="playersRow">

<div className="playerBlock">

<div className="playerPhoto">
👤
</div>

<div className="playerName">
Carlos Alcaraz
</div>

<div className="aiBox">

<div>AI WIN</div>

<strong>67%</strong>

<div>
Агрессивная игра<br/>
Высокая форма
</div>

</div>

</div>

<div className="scoreBlock">

<div
style={{
fontSize:"15px",
color:"#19d96d",
fontWeight:"800"
}}
>
LIVE
</div>

<div
style={{
marginTop:"6px",
fontSize:"18px",
fontWeight:"700"
}}
>
Set 1
</div>

<div
style={{
fontSize:"18px",
fontWeight:"700"
}}
>
Game 2
</div>

<div
style={{
fontSize:"34px",
fontWeight:"900",
marginTop:"10px",
marginBottom:"8px"
}}
>
15 : 30
</div>

<div
style={{
fontSize:"24px",
fontWeight:"800",
color:"#18d96d"
}}
>
1 : 0
</div>

</div>

<div className="playerBlock">

<div className="playerPhoto">
👤
</div>

<div className="playerName">
Novak Djokovic
</div>

<div className="aiBox">

<div>AI WIN</div>

<strong>33%</strong>

<div>
Ждёт брейк<br/>
Играет осторожно
</div>

</div>

</div>

</div>

</div>

);

}
