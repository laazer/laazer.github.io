
$(function() {
    $('.chart').easyPieChart({
        easing: 'easeOutBounce',
        onStep: function(from, to, percent) {
            $(this.el).find('.percent');
        },
        barColor:'#2C3E50',
        lineWidth:20,
        lineCap:'circle',
        scaleColor:false
    });
    var chart = window.chart = $('.chart').data('easyPieChart');
    $('.js_update').on('click', function() {
        chart.update(Math.random()*200-100);
    });
});
