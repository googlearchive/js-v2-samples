var demo = window.location.hash;
if (demo != "#demo") {
  style = document.createElement("link");
  style.type = "text/css";
  style.rel = "stylesheet";
  style.href = "css/style.css";

  head = document.getElementsByTagName("head")[0];
  head.appendChild(style);

  header = document.createElement("div");
  header.id = "header";

  para = document.createElement("p");

  tag = document.createElement("a");
  tag.href = "http://code.google.com/apis/fusiontables/docs/sample_code.html";
  tag.innerHTML = "&lt; Back to Fusion Tables samples";

  para.appendChild(tag);
  header.appendChild(para);

  document.body.insertBefore(header, document.body.childNodes[0]);
}
  document.getElementById('code').innerHTML = 
    "<p>The Code:</p>" + "<pre>" + document.getElementById('script').innerHTML.replace(/</g, "&lt;") + "</pre>";
