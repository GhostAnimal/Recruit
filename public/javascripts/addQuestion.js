$('#submit').on('click', function(event) {
	event.preventDefault();
	if (check()==true) {
		$('#question').submit()
	}
});

function check() {
	var items = $('input')
	for (var i = 5  ; i > 0; i--) {
		if (items[i].val()=='') {
			alert('必要信息填写不完整')
			return false
		}
	}

	if ($('textarea')[0]=='') {
		alert('必要信息填写不完整')
		return false
	}

	if (items[5].val()=='' && items[6].val()=='') {
		alert('flag或是否提交writeup必须填写一个')
		return false
	}

	if (items[5].val()!='' && items[6].val()!='') {
		alert('flag或是否提交writeup只能填写一个')
		return false
	}
	
	return true
}