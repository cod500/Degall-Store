$(document).ready(function(){
    $('.confirm-delete').on('click', function(){
        if(!confirm('Confirm Deletion?')) return false
    });

    CKEDITOR.replace('content', {
        plugins: 'wysiwygarea,toolbar,basicstyles,link'
    });

})