//---------------page---------------
for (i=0; i<site.length; i++) {
	if (site_name == 'index' || site[i].tag.includes(loc.search)) {
	 //div.page
	text_box = $('#contents');
    create('div');
    new_elm.className = 'page';
    new_elm.id = 'page' + i;
    apC();
	
	 //a.page_tag
    for (i2=0; i2<site[i].tag.length; i2++) {
		text_box = $('#page'+i);

        create('a');
        new_elm.href = 'tag.html?' + site[i].tag[i2];
        new_elm.innerText = '#' + tag[site[i].tag[i2]];
        new_elm.className = 'page_tag';
        apC();

        create('span');
        new_elm.innerText = ' ';
        apC();
    }
	
	 //br
	create('br');
	apC();
	
	//img.page_img
	create('img');
	new_elm.className = 'page_img';
	new_elm.src = 'img/' + site[i].img;
	new_elm.alt = 'img';
	apC();
	
	//a.page_name
	create('a');
	new_elm.className = 'page_name';
	new_elm.innerText = site[i].name;
	new_elm.href = site[i].link;
	apC();
	
	//div.page_date
	create('div');
	new_elm.className = 'page_date';
	new_elm.innerText = '最終更新日. ' + site[i].date;
	apC();
	
	//hr.page_hr
	create('hr');
	new_elm.className = 'page_hr';
	apC();
	
	//div.page_txt
	create('div');
	new_elm.className = 'page_txt';
	new_elm.innerText = site[i].txt;
	apC();
	}
}

//---------------tag---------------
let numbers_tag = [];
for (i=0; i<tag.length; i++) {
	// tr#tag_tr+i
	text_box = $('#tag_table')
	create('tr');
	new_elm.id = 'tag_tr' + i;
	apC();

	text_box = $('#tag_tr'+i);
	create('td');
	new_elm.id = 'tag_name' + i;
	apC();

	text_box = $('#tag_name'+i);
	create('a');
	new_elm.href = 'tag.html?' + i;
	new_elm.innerText = '#' + tag[i];
	apC();

	text_box = $('#tag_tr'+i);
	create('td');
	new_elm.id = 'numbers_tag' + i;
	apC();


	numbers_tag.push(0);
}

for (i=0; i<site.length; i++) {
	for (i2=0; i2<site[i].tag.length; i2++) {
		numbers_tag[site[i].tag[i2]]++;
	}
}

for (i=0; i<tag.length; i++) {
	$('#numbers_tag'+i).innerText = numbers_tag[i];
}

if (site_name != 'index') {
	$('#main_h1').innerText = '#' + tag[loc.search];
}
