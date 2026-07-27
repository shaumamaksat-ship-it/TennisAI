import {analyzeMatch} from "./AIEngine";
import "./AIStyles.css";

export default function AIAnalysis({match}){

const ai=analyzeMatch(match);

return(

<div className="aiCard">

<h2>🧠 TennisAI</h2>

<div className="aiRow">
<span>Вероятность победы</span>
</div>

<div className="aiBar">

<div
className="green"
style={{width:ai.win1+"%"}}
>
{ai.win1}%
</div>

<div
className="red"
style={{width:ai.win2+"%"}}
>
{ai.win2}%
</div>

</div>

<div className="aiItem">
📈 Momentum
<b>{ai.momentum}%</b>
</div>

<div className="aiItem">
💪 Усталость игрока 1
<b>{ai.fatigue1}%</b>
</div>

<div className="aiItem">
💪 Усталость игрока 2
<b>{ai.fatigue2}%</b>
</div>

<div className="aiItem">
🧠 Психология
<b>{ai.psychology}</b>
</div>

<div className="aiItem">
⭐ Ключевой фактор
<b>{ai.keyFactor}</b>
</div>

<div className="prediction">

💡 {ai.recommendation}

</div>

</div>

);

}
