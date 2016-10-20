$('#add').on('click', function(event) {
	event.preventDefault();
	if (check()==true) {
		$('#question').submit()
	}
});

function check() {
	console.log($('input'))
	for (var i = 1; i <= 2; i++) {
		if ($('input')[i].value=='') {
			alert('必要信息填写不完整')
			return false
		}
	}
	if ($('input')[3].checked==false && $('input')[4].checked==false && $('input')[5].checked==false) {
		alert('未选择分类')
		return false
	}
	if ($('textarea')[0].value=='') {
		alert('必要信息填写不完整')
		return false
	}
	for (var i = 6; i <= 7; i++) {
			console.log($('input')[i].value)		
		if ($('input')[i].value=='') {
			alert('必要信息填写不完整')
			return false
		}
	}


	if ($('input')[10].value=='' && $('input')[9].value==false) {
		alert('flag或是否提交writeup必须填写一个')
		return false
	}

	if ($('input')[10].value!='' && $('input')[8].value==true) {
		alert('flag或是否提交writeup只能填写一个')
		return false
	}
	
	return true
}