# OpenSeadragonizer_mod_hentaigana

[OpenSeadragonizer]改造版（連番画像向け＋変体仮名の画像認識システム）

[OpenSeadragonizer]: http://openseadragon.github.io/openseadragonizer/

## 使い方

表示したい画像のURLと総コマ数を入力してください。

例えば、古活字版（嵯峨本）『[伊勢物語]』を表示したい場合、index.htmlを開いて、次のように入力します。

[伊勢物語]: http://www.wul.waseda.ac.jp/kotenseki/html/he12/he12_04353/index.html

- 画像のURL：http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0001.jpg
- 総コマ数：121

入力後に表示される次のURLをTwitter等で利用すれば、閲覧した方は[OpenSeadragon]の機能を用いて拡大縮小やページ移動することができます。

- http://2sc1815j.github.io/openseadragonizer_mod_hentaigana/?img=http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0001.jpg&pages=121

[OpenSeadragon]: https://openseadragon.github.io/

現在表示しているページのURLについては、モダンなブラウザであれば、ページ移動や領域選択に応じてアドレスバーが自動更新されます。IE9以下などの古いブラウザでは、[ u ]キーを押下してください。

### 「変体仮名の画像認識システム」の利用

スクリプトと同じオリジンから画像を読み込んでいる場合には、領域選択モード（「c」キーの押下で切り替え）が有効となります。領域を選択すると、「[変体仮名の画像認識システム]」のAPIを利用して、選択された範囲の文字認識結果を表示します。変体仮名1文字分の範囲を選択してください。

[変体仮名の画像認識システム]: https://hentaigana.herokuapp.com/

- 古活字版（嵯峨本）『[伊勢物語　上]( http://www.digital.archives.go.jp/das/meta/M2012102621183556258)』（国立公文書館所蔵）を表示し、変体仮名の画像認識システムを有効にする例
 - https://2sc1815j.github.io/openseadragonizer_mod_hentaigana/?img=https://2sc1815j.github.io/openseadragonizer_mod_hentaigana/sample_image/M2012102621183556258_M2012102621183556258_0004.jpg&pages=10

### キーボードショートカット (keyboard shortcuts)

- [ n, >, . ] - 次のコマへ移動 (next page)
- [ p, <, , ] - 前のコマへ移動 (previous page)
- [ c ] - 領域選択モード切り替え (toggle selection mode)
- [ f ] - フルスクリーン切り替え (toggle full page)
- [ u ] - 現在のコマのURLを表示 (show the URL of the current image)
