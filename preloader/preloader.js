/**/
Preloader.addStyle('cubic', function() {
    /*create loader html*/
    var html = document.createElement('div');
    html.className += ' cubic-loader';

    var divInner = document.createElement('div');
    divInner.className += ' cubic-loader-inner';
    html.append(divInner);

    return html;
});