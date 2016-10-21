$(function() {
	$('.del').on('click', function(event) {
		event.preventDefault();
		
		var target = $(event.target)
		var id = target.data('id')

		$.ajax({
			url: '/removeQuestion?id=' + id,
			type: 'delete',			
		})
		.done(function(result) {
			if (result.success === 1) {
				alert('删除成功')
				window.location.href = window.location.href
			}
		})
		
	});
	$('#delCat').on('click', function(event) {
		event.preventDefault();
		
		var target = $(event.target)
		var id = target.data('id')

		$.ajax({
			url: '/removeCat?id=' + id,
			type: 'delete',			
		})
		.done(function(result) {
			if (result.success === 1) {
				alert('删除成功')
				window.location.href = '/admin'
			}
		})
		
	});
})