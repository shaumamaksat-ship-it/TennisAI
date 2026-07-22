from flask import Flask, request, render_template_string
from live_predict import predict

app = Flask(__name__)


HTML = """
<!DOCTYPE html>
<html>
<head>
<title>TennisAI</title>

<meta name="viewport" content="width=device-width, initial-scale=1">

<style>

body {
    font-family: Arial;
    background: #111;
    color: white;
    text-align: center;
    padding: 20px;
}

input, select, button {
    width: 90%;
    padding: 12px;
    margin: 8px;
    font-size: 18px;
}

button {
    background: green;
    color: white;
    border-radius: 10px;
}

.box {
    background: #222;
    padding: 15px;
    border-radius: 15px;
    margin-top: 20px;
}

.live {
    background: #003300;
    border: 2px solid lime;
}

</style>

</head>


<body>

<h1>🎾 TennisAI</h1>

<div class="box live">
<h2>🔥 LIVE режим</h2>
<p>AI анализирует текущий матч и счёт</p>
</div>


<form method="post">

<input name="player1" placeholder="Игрок 1">

<input name="player2" placeholder="Игрок 2">


<select name="surface">

<option>Hard</option>
<option>Clay</option>
<option>Grass</option>

</select>


<button type="submit">
🎾 ПОЛУЧИТЬ LIVE ПРОГНОЗ
</button>


</form>



{% if result %}

<div class="box">

<h2>Результат анализа</h2>

<pre>{{result}}</pre>

</div>

{% endif %}



</body>
</html>
"""


@app.route("/", methods=["GET","POST"])
def home():

    result = ""

    if request.method == "POST":

        p1 = request.form["player1"]

        p2 = request.form["player2"]

        surface = request.form["surface"]


        result = predict(
            p1,
            p2,
            surface
        )


    return render_template_string(
        HTML,
        result=result
    )



if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )
