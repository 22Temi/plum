var modalImgWrap = document.querySelector('#img-modal .modal-content .img-wrap');

modalImgWrap && (function () {
    function imageListener(images) {
        Array.prototype.forEach.call(images, function (imageElement) {
            imageElement.addEventListener('click', function (ev) {
                modalImgWrap.style.background = 'center / contain no-repeat url(' + ev.target.src + ')';
                openModal('#img-modal', true, true, true);
            });
        });
    }

    var images = document.querySelectorAll('.kg-gallery-card img');
    imageListener(images);

    images = document.querySelectorAll('.kg-image-card img');
    imageListener(images);
})();


modalImgWrap && modalImgWrap.addEventListener('click', function () {
    closeModal();
});
