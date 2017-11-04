from flask import Flask, render_template, request
import json

app = Flask(__name__)

file = open('result.json', 'r')
result = json.load(file)


@app.route('/', methods=['GET', 'POST'])
def index():
    """Return index.html
    """
    if request.method == 'POST':
        keyword = request.form['keyword']
        if keyword:
            return render_template(
                'index.html',
                query=result[keyword],
                keyword=keyword)
    return render_template('index.html')


if __name__ == '__main__':
    app.debug = True  # デバッグモード有効化
    app.run(host='https://sartan123.github.io/seach_engine/templates/index.html')  # どこからでもアクセス可能に
