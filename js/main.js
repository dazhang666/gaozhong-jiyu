/* ===== 数据 ===== */
var storiesData = window.storiesData || {};
var categories = storiesData;

// 展平所有故事（用于列表和搜索）
function flattenStories() {
    var all = [];
    for (var key in categories) {
        var cat = categories[key];
        if (cat && cat.list) {
            for (var i = 0; i < cat.list.length; i++) {
                var s = cat.list[i];
                s._category = key;
                all.push(s);
            }
        }
    }
    return all;
}

// 获取某个分支下的所有故事
function getBranchStories(branchKey) {
    var cat = categories[branchKey];
    if (!cat || !cat.list) return [];
    var list = [];
    for (var i = 0; i < cat.list.length; i++) {
        var s = cat.list[i];
        s._category = branchKey;
        list.push(s);
    }
    return list;
}

/* ===== 状态 ===== */
var state = {
    currentSection: 'stories',
    currentBranch: null,
    searchQuery: '',
};

/* ===== DOM 引用 ===== */
var $ = function(sel) { return document.querySelector(sel); };
var content = $('#mainContent');
var menuItems = document.querySelectorAll('.menu-item');
var submenuItems = document.querySelectorAll('.submenu-item');
var searchInput = $('#searchInput');
var searchClear = $('#searchClear');
var menuToggle = $('#menuToggle');
var sidebar = $('#sidebar');

/* ===== 工具 ===== */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCategoryName(key) {
    return categories[key] ? categories[key].name : '';
}

/* ================================================ */
/* ===== 渲染：故事列表（全部或按分支过滤） ===== */
/* ================================================ */
function renderStoryList(opts) {
    var branch = (opts && opts.branch) || null;
    var query = (opts && opts.query) || '';

    var allStories = branch ? getBranchStories(branch) : flattenStories();

    if (query) {
        var q = query.toLowerCase();
        var filtered = [];
        for (var i = 0; i < allStories.length; i++) {
            var s = allStories[i];
            if (s.title.toLowerCase().includes(q) ||
                (s.content && s.content.toLowerCase().includes(q))) {
                filtered.push(s);
            }
        }
        allStories = filtered;
    }

    var titleText = '高中故事';
    var descText = '那些年我们一起经历的点点滴滴';
    var notice = '以下所有东西如有冒犯，请即刻联系我，我立马删除或修改。如果你有想加入的东西，也可以直接联系我。大家可微信联系我，或者邮箱联系195212681@qq.com。';

    if (branch) {
        var cat = categories[branch];
        if (cat) titleText = (cat.icon || '') + ' ' + cat.name;
    }
    if (query) titleText = '🔍 搜索结果';

    var html = '';
    html += '<div class="section-header">';
    if (branch) {
        html += '<button class="back-link" id="backToAll">← 全部故事</button>';
    }
    html += '<h1>' + titleText + '</h1>';
    if (query) {
        html += '<p>包含 "' + query + '" 的故事</p>';
    } else if (!branch) {
        html += '<p>' + descText + '</p>';
        html += '<p class="story-notice">' + notice + '</p>';
    } else {
        html += '<p>' + (categories[branch] ? categories[branch].description : '') + '</p>';
        html += '<p class="story-notice">' + notice + '</p>';
    }
    html += '</div>';

    html += '<div class="story-list">';
    if (allStories.length === 0) {
        html += '<div class="search-no-result">没有找到相关故事 🙈</div>';
    } else {
        for (var i = 0; i < allStories.length; i++) {
            var s = allStories[i];
            html += '<div class="story-item" data-id="' + s.id + '" data-branch="' + s._category + '">';
            html += '<span class="story-title">' + s.title + '</span>';
            if (!branch && s._category) {
                var tagName = getCategoryName(s._category);
                if (tagName) {
                    html += '<span class="story-tag">' + tagName + '</span>';
                }
            }
            html += '<span class="story-arrow">→</span>';
            html += '</div>';
        }
    }
    html += '</div>';

    if (!query) {
        html += '<div class="story-count">共 ' + allStories.length + ' 个故事</div>';
    } else {
        html += '<div class="story-count">找到 ' + allStories.length + ' 个结果</div>';
    }

    content.innerHTML = html;

    // 返回全部按钮
    var backBtn = $('#backToAll');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            state.currentBranch = null;
            updateSubmenuActive(null);
            renderStoryList();
            setTimeout(function() { window.scrollTo(0, savedScrollPos); }, 50);
        });
    }

    // 绑定故事点击
    var items = content.querySelectorAll('.story-item');
    for (var i = 0; i < items.length; i++) {
        (function(el) {
            el.addEventListener('click', function() {
                renderStoryDetail(el.dataset.id, el.dataset.branch);
            });
        })(items[i]);
    }
}

/* ================================================ */
/* ===== 渲染：故事详情 ===== */
/* ================================================ */
var savedScrollPos = 0;
function renderStoryDetail(storyId, branchKey) {
    savedScrollPos = window.scrollY || document.documentElement.scrollTop || 0;
    
    var cat = categories[branchKey];
    if (!cat) return;

    var story = null;
    for (var i = 0; i < cat.list.length; i++) {
        if (cat.list[i].id === storyId) {
            story = cat.list[i];
            break;
        }
    }
    if (!story) return;

    var html = '';
    html += '<div class="detail-view">';
    html += '<div class="detail-header">';
    html += '<button class="detail-back" id="backToList">';
    html += '← 返回' + (state.currentBranch ? cat.name : '列表');
    html += '</button>';
    html += '<h2 class="detail-title">' + story.title + '</h2>';
    html += '</div>';
    html += '<div class="detail-content">';
    html += story.content || '（暂无内容）';
    html += '</div>';
    html += '</div>';

    content.innerHTML = html;

    $('#backToList').addEventListener('click', function() {
        if (state.currentBranch) {
            renderStoryList({ branch: state.currentBranch });
        } else {
            renderStoryList();
        }
        setTimeout(function() { window.scrollTo(0, savedScrollPos); }, 50);
    });
}

/* ===== 纪念照 ===== */
function renderPhotos() {
    var photos = [
        "照片1.jpg", "照片2.jpg", "照片3.jpg", "照片4.jpg",
        "照片6.jpg", "照片7.jpg", "照片8.jpg",
        "照片10.jpg", "照片11.jpg", "照片12.jpg"
    ];

    var html = "";
    html += "<div class=\"section-header\">";
    html += "<h1>📸 高中纪念照</h1>";
    html += "<p class=\"photo-notice\">后两张是学姐拍的合集，扫描观看，不止包含咱们班。</p>";
    html += '<p class="load-notice">pdf文件较大，我也没有压缩，请耐心等待加载</p>';
    html += "</div>";
    html += "<div class=\"photo-gallery\" id=\"photoGallery\">";

    for (var i = 0; i < photos.length; i++) {
        html += "<div class=\"photo-item\" data-index=\"" + i + "\">";
        html += "<img class=\"photo-thumb\" src=\"" + photos[i] + "\" alt=\"纪念照" + (i + 1) + "\" loading=\"lazy\">";
        html += "</div>";
    }

    html += "</div>";
    content.innerHTML = html;

    // 点击放大
    var items = content.querySelectorAll(".photo-item");
    for (var i = 0; i < items.length; i++) {
        (function(idx) {
            items[idx].addEventListener("click", function() {
                openLightbox(photos, idx);
            });
        })(i);
    }
}

/* ===== 照片灯箱 ===== */
function openLightbox(photos, startIndex) {
    var current = startIndex;
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.id = "lightbox";

    overlay.innerHTML =
        "<button class=\"lightbox-close\" id=\"lbClose\">✕</button>" +
        "<button class=\"lightbox-nav lightbox-prev\" id=\"lbPrev\">‹</button>" +
        "<div class=\"lightbox-content\">" +
        "<img class=\"lightbox-image\" id=\"lbImg\" src=\"" + photos[current] + "\" alt=\"\">" +
        "<div class=\"lightbox-counter\" id=\"lbCounter\">" + (current + 1) + " / " + photos.length + "</div>" +
        "</div>" +
        "<button class=\"lightbox-nav lightbox-next\" id=\"lbNext\">›</button>";

    document.body.appendChild(overlay);

    function showImage(idx) {
        if (idx < 0 || idx >= photos.length) return;
        current = idx;
        var img = document.getElementById("lbImg");
        if (img) {
            img.src = photos[current];
        }
        var counter = document.getElementById("lbCounter");
        if (counter) {
            counter.textContent = (current + 1) + " / " + photos.length;
        }
        var prev = document.getElementById("lbPrev");
        var next = document.getElementById("lbNext");
        if (prev) prev.style.display = current <= 0 ? "none" : "flex";
        if (next) next.style.display = current >= photos.length - 1 ? "none" : "flex";
    }

    setTimeout(function() {
        document.getElementById("lbClose").addEventListener("click", function() {
            document.body.removeChild(overlay);
        });
        document.getElementById("lbPrev").addEventListener("click", function() {
            showImage(current - 1);
        });
        document.getElementById("lbNext").addEventListener("click", function() {
            showImage(current + 1);
        });
        showImage(current);
    }, 50);

    // 键盘支持
    function keyHandler(e) {
        if (e.key === "Escape") {
            if (document.getElementById("lightbox")) {
                document.body.removeChild(overlay);
            }
            document.removeEventListener("keydown", keyHandler);
        }
        if (e.key === "ArrowLeft") showImage(current - 1);
        if (e.key === "ArrowRight") showImage(current + 1);
    }
    document.addEventListener("keydown", keyHandler);

    overlay.addEventListener("click", function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}



/* ===== 通用翻页阅读器 ===== */
function renderBookViewer(title, icon, desc, pageDir, totalPages) {
    var currentPage = 1;

    function buildViewer(pn) {
        var prevD = pn <= 1 ? " disabled" : "";
        var nextD = pn >= totalPages ? " disabled" : "";
        var html = "";
        html += "<div class=\"book-viewer\">";
        html += "<div class=\"book-header\">";
        html += "<h1>" + icon + " " + title + "</h1>";
        html += "<p>" + desc + "</p>";
        html += '<p class="load-notice">图片正在加载，请耐心等待</p>';
        html += "</div>";
        html += "<div class=\"book-body\">";
        html += "<button class=\"book-nav book-prev\" id=\"bkPrev\"" + prevD + ">‹</button>";
        html += "<div class=\"book-page-wrapper\">";
        html += "<img class=\"book-page\" id=\"bkImg\" src=\"" + pageDir + "/page_" + String(pn).padStart(3, "0") + ".jpg\" alt=\"第" + pn + "页\">";
        html += "<div class=\"book-page-num\">" + pn + " / " + totalPages + "</div>";
        html += "</div>";
        html += "<button class=\"book-nav book-next\" id=\"bkNext\"" + nextD + ">›</button>";
        html += "</div>";
        html += "</div>";
        return html;
    }

    content.innerHTML = buildViewer(currentPage);

   function goToPage(n) {
       if (n < 1 || n > totalPages) return;
       currentPage = n;
       var img = document.getElementById("bkImg");
       if (img) {
           img.style.opacity = "0";
           setTimeout(function() {
               img.src = pageDir + "/page_" + String(n).padStart(3, "0") + ".jpg";
               img.style.opacity = "1";
               var p = document.getElementById("bkPrev");
               var nx = document.getElementById("bkNext");
               if (p) p.disabled = n <= 1;
               if (nx) nx.disabled = n >= totalPages;
               var num = document.querySelector(".book-page-num");
               if (num) num.textContent = n + " / " + totalPages;
                // 预加载下一页
                if (n < totalPages) {
                    var nextImg = new Image();
                    nextImg.src = pageDir + "/page_" + String(n + 1).padStart(3, "0") + ".jpg";
                }
                // 预加载上一页
                if (n > 1) {
                    var prevImg = new Image();
                    prevImg.src = pageDir + "/page_" + String(n - 1).padStart(3, "0") + ".jpg";
                }
           }, 150);
       }
   }

    setTimeout(function() {
        var pBtn = document.getElementById("bkPrev");
        var nBtn = document.getElementById("bkNext");
        if (pBtn) pBtn.addEventListener("click", function() { goToPage(currentPage - 1); });
        if (nBtn) nBtn.addEventListener("click", function() { goToPage(currentPage + 1); });
    }, 50);

    function keyH(e) {
        if (state.currentSection === "psychology" || state.currentSection === "yearbook" || state.currentSection === "essays") {
            if (e.key === "ArrowLeft") goToPage(currentPage - 1);
            if (e.key === "ArrowRight") goToPage(currentPage + 1);
        }
    }
    if (window._bkKeyHandler) document.removeEventListener("keydown", window._bkKeyHandler);
    window._bkKeyHandler = keyH;
    document.addEventListener("keydown", keyH);
}
/* ===== 心理本 ===== */
function renderPsychology() {
    renderBookViewer("心理本", "📓", "我们的心理课堂记忆", "pages_psych", 168);
}


/* ===== 编者有话说 ===== */
function renderEditor() {
    content.innerHTML =
        '<div class="editor-view">' +
        '<div class="editor-card">' +
        '<h1>💭 编者有话说</h1>' +
        '<div class="editor-text">' +
        '<p>前几天王牧歌问我高中三年就这么过去了，你没有啥感慨吗，但是我没太在意，主要是刷视频来劲了。</p>' +
        '<p>之后，过了两三天接连碰到倒霉事，emo上了，就开始回味。突然就想整一个纪念高中三年，于是这个网站就诞生了。</p>' +
        '<p>有图片的都需要加载，手机可能会更快一些，会出现翻到第二页还是第一页的内容情况，请耐心等待刷新，而且这些东西都是我手机扫描的，可以说是相当粗糙了，画质我也一定程度上降低了，要不然加载更慢，大家见谅。这些东西大家手头基本都有，我只是想做一个整理，但还是希望大家珍惜纸质版。</p>' +
        '<p>网站里的东西如果有冒犯，请您联系我，我会立刻删除修改。如果您有想添加的也可以联系我，主界面就有我的联系方式。</p>' +
        '<p>祝大家以后的日子，学业有成，天天开心。也希望大家毕业后，也别忘了大家一起经历的事，常联系。</p>' +
        '<div class="editor-signature">2026.7.27</div>' +
        '</div>' +
        '</div>' +
        '</div>';
}



/* ===== 来时路数据 ===== */
var lailuData = {
    "grade10-1": {
        "name": "高一上",
        "names": [
            "马岩","苗润晨","迟毓晗","张莫静","庞雨晴","崔丽慧","高跃","周晨",
            "蔺意曈","张健依","张莫野","卞悦言","高湛","李欣颖","景子一","宁思晴",
            "陈希","王紫诺","运东佳","李恩惠","岳洋","王思童","高艺丹","刘晓妍",
            "张艺凡","于粟宇","孙晨轩","韩多米","崔柏胜","韩壮","刘子木","郑茗元",
            "张庆泽","阎宝宇","高铭睿","汪鑫","李荣轩","岳一繁","王泽汉","刘佳裕",
            "王宗瑞","林佳明","童乐岩","王牧歌","李檬汐","李佳兴","刘相","刘运泽",
            "赵子铭","肖琳议"
        ]
    },
    "grade10-2": {
        "name": "高一下",
        "names": [
            "高跃","王紫诺","苗润晨","马岩","迟毓晗","张莫静","崔丽慧","张莫野",
            "卞悦言","周晨","陈希","刘欣宜","高艺丹","丁梓芯","运东佳","邓惜文",
            "张艺凡","孙晨轩","韩壮","汪鑫","于粟宇","张庆泽","刘相","高铭睿",
            "岳一繁","韩多米","李荣轩","王牧歌","肖金亮","阎宝宇","赵达","李檬汐",
            "林佳明","刘运泽","刘佳裕","宋鑫博","杨瑞丰","刘子杨","童乐岩","于哲",
            "于淏然","崔柏胜","尚佳民","王钦宇","陈子俊","王宗瑞","郑茗元","刘子木","王泽汉"
        ]
    },
    "grade11-1": {
        "name": "高二上",
        "names": [
            "高跃","马岩","张莫静","张莫野","崔丽慧","王紫诺","高艺丹","迟毓晗",
            "邓惜文","刘欣宜","苗润晨","运东佳","卞悦言","丁梓芯","魏杉杉","周晨",
            "陈希","张艺凡","韩壮","汪鑫","韩多米","孙晨轩","岳一繁","于粟宇",
            "高铭睿","阎宝宇","张庆泽","刘相","肖金亮","林佳明","崔柏胜","赵达",
            "刘子杨","于哲","王牧歌","童乐岩","李荣轩","刘佳裕","王宗瑞","刘运泽",
            "李檬汐","陈子俊","王钦宇","刘子木","郑茗元","宋鑫博","于淏然","王泽汉"
        ]
    },
    "grade11-2": {
        "name": "高二下",
        "names": [
            "高跃","马岩","张莫静","张莫野","崔丽慧","王紫诺","高艺丹","迟毓晗",
            "邓惜文","刘欣宜","苗润晨","运东佳","卞悦言","丁梓芯","魏杉杉","周晨",
            "陈希","张艺凡","韩壮","汪鑫","韩多米","孙晨轩","岳一繁","于粟宇",
            "高铭睿","阎宝宇","张庆泽","刘相","肖金亮","林佳明","崔柏胜","赵达",
            "刘子杨","于哲","王牧歌","童乐岩","李荣轩","刘佳裕","王宗瑞","刘运泽",
            "李檬汐","陈子俊","王钦宇","刘子木","郑茗元","宋鑫博","于淏然","王泽汉"
        ]
    },
    "grade12-1": {
        "name": "高三上",
        "names": [
            "高跃","江怡宁","张莫静","崔丽慧","王紫诺","迟毓晗","马岩","张莫野",
            "苗润晨","卞悦言","孙佳玲","刘欣宜","高艺丹","魏杉杉","李悦涵","邓惜文",
            "丁梓芯","运东佳","张艺凡","韩壮","孙晨轩","高铭睿","刘相","韩多米",
            "岳一繁","汪鑫","阎宝宇","张庆泽","于粟宇","肖琳议","肖金亮","林佳明",
            "孙启航","王宗瑞","童乐岩","崔柏胜","赵达","李荣轩","刘运泽","于哲",
            "王钦宇","王牧歌","刘佳裕","李檬汐","刘子杨","宋鑫博","刘子木"
        ]
    },
    "grade12-2": {
        "name": "高三下",
        "names": [
            "高跃","江怡宁","张莫静","崔丽慧","王紫诺","迟毓晗","马岩","张莫野",
            "苗润晨","卞悦言","孙佳玲","刘欣宜","高艺丹","魏杉杉","李悦涵","邓惜文",
            "丁梓芯","运东佳","张艺凡","韩壮","孙晨轩","高铭睿","刘相","韩多米",
            "岳一繁","汪鑫","阎宝宇","张庆泽","于粟宇","肖琳议","肖金亮","林佳明",
            "孙启航","王宗瑞","童乐岩","崔柏胜","赵达","李荣轩","刘运泽","于哲",
            "王钦宇","王牧歌","刘佳裕","李檬汐","刘子杨","宋鑫博","刘子木"
        ]
    }
};

/* ===== 来时路 ===== */
function renderLailu() {
    var html = "";
    html += "<div class=\"section-header\">";
    html += "<h1>🛤️ 来时路</h1>";
    html += "<p>那些年坐在同一间教室里的人</p>";
    html += "</div>";
    html += "<div class=\"branch-grid\">";

    var keys = ["grade10-1","grade10-2","grade11-1","grade11-2","grade12-1","grade12-2"];
    for (var i = 0; i < keys.length; i++) {
        var g = lailuData[keys[i]];
        var count = g.names ? g.names.length : 0;
        html += "<div class=\"branch-card\" data-lailu=\"" + keys[i] + "\">";
        html += "<div class=\"branch-icon\">📚</div>";
        html += "<h3 class=\"branch-name\">" + g.name + "</h3>";
        html += "<span class=\"branch-count\">" + count + " 人</span>";
        html += "</div>";
    }

    html += "</div>";
    content.innerHTML = html;

    var cards = content.querySelectorAll(".branch-card");
    for (var i = 0; i < cards.length; i++) {
        (function(el) {
            el.addEventListener("click", function() {
                renderLailuGrade(el.dataset.lailu);
            });
        })(cards[i]);
    }
}

/* ===== 来时路 - 年级详情 ===== */
function renderLailuGrade(gradeKey) {
    var g = lailuData[gradeKey];
    if (!g) return;

    var html = "";
    html += "<div class=\"section-header\">";
    html += "<button class=\"back-link\" id=\"backLailu\">← 全部</button>";
    html += "<h1>📚 " + g.name + "</h1>";
    html += "<p>共 " + g.names.length + " 人</p>";
    html += "</div>";
    html += "<div class=\"namelist\">";

    for (var i = 0; i < g.names.length; i++) {
        html += "<span class=\"namelist-item\">" + g.names[i] + "</span>";
    }

    html += "</div>";
    content.innerHTML = html;

    document.getElementById("backLailu").addEventListener("click", function() {
        renderLailu();
    });
}

/* ================================================ */
/* ===== 切换板块 ===== */
/* ================================================ */
function switchSection(section) {
    state.currentSection = section;
    state.currentBranch = null;
    state.searchQuery = '';
    searchInput.value = '';
    searchClear.classList.remove('visible');
    hideSuggestions();
    updateSubmenuActive(null);

    for (var i = 0; i < menuItems.length; i++) {
        var item = menuItems[i];
        if (item.dataset.section === section) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    }

    switch (section) {
        case 'stories':
            renderStoryList();
            break;
        case 'photos':
            renderPhotos();
            break;
        case 'psychology':
            renderPsychology();
            break;
        case 'documentary':
            renderDocumentary();
            break;
        case 'yearbook':
            renderYearbook();
            break;
        case 'essays':
            renderEssays();
            break;
        case 'lailu':
            renderLailu();
            break;
        case 'editor':
            renderEditor();
            break;

    }
}



/* ===== 欢迎弹窗 ===== */
function showWelcome() {
    // 检查是否已经看过（session内）
    if (sessionStorage.getItem("welcomeShown")) return;

    var overlay = document.createElement("div");
    overlay.className = "welcome-overlay";
    overlay.id = "welcomeOverlay";

    overlay.innerHTML =
        '<div class="welcome-modal">' +
        '<button class="welcome-close" id="welcomeClose">✕</button>' +
        '<h2>💭 编者有话说</h2>' +
        '<div class="welcome-text">' +
        '<p>前几天王牧歌问我高中三年就这么过去了，你没有啥感慨吗，但是我没太在意，主要是刷视频来劲了。</p>' +
        '<p>之后，过了两三天接连碰到倒霉事，emo上了，就开始回味。突然就想整一个纪念高中三年，于是这个网站就诞生了。</p>' +
        '<p>有图片的都需要加载，手机可能会更快一些，会出现翻到第二页还是第一页的内容情况，请耐心等待刷新，而且这些东西都是我手机扫描的，可以说是相当粗糙了，画质我也一定程度上降低了，要不然加载更慢，大家见谅。这些东西大家手头基本都有，我只是想做一个整理，但还是希望大家珍惜纸质版。</p>' +
        '<p>网站里的东西如果有冒犯，请您联系我，我会立刻删除修改。如果您有想添加的也可以联系我，主界面就有我的联系方式。</p>' +
        '<p>祝大家以后的日子，学业有成，天天开心。也希望大家毕业后，也别忘了大家一起经历的事，常联系。</p>' +
        '<div class="welcome-signature">2026.7.27</div>' +
        '</div>' +
        '<button class="welcome-btn" id="welcomeBtn">我知道了，开始浏览</button>' +
        '</div>';

    document.body.appendChild(overlay);

    function closeWelcome() {
        var el = document.getElementById("welcomeOverlay");
        if (el) document.body.removeChild(el);
        sessionStorage.setItem("welcomeShown", "1");
    }

    setTimeout(function() {
        var btn = document.getElementById("welcomeBtn");
        var close = document.getElementById("welcomeClose");
        if (btn) btn.addEventListener("click", closeWelcome);
        if (close) close.addEventListener("click", closeWelcome);
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) closeWelcome();
        });
    }, 50);
}

/* ===== 更新子菜单高亮 ===== */
function updateSubmenuActive(branchKey) {
    for (var i = 0; i < submenuItems.length; i++) {
        var item = submenuItems[i];
        if (item.dataset.branch === branchKey) {
            item.classList.add('active-branch');
        } else {
            item.classList.remove('active-branch');
        }
    }
}

/* ================================================ */
/* ===== 搜索功能 ===== */
/* ================================================ */
function performSearch(query) {
    state.searchQuery = query;
    if (state.currentSection !== 'stories') {
        switchSection('stories');
        setTimeout(function() { performSearch(query); }, 50);
        return;
    }

    if (!query) {
        renderStoryList({ branch: state.currentBranch });
        return;
    }

    renderStoryList({ branch: state.currentBranch, query: query });
}

function showSuggestions(query) {
    if (!query || state.currentSection !== 'stories') {
        hideSuggestions();
        return;
    }

    var q = query.toLowerCase();
    var allStories = flattenStories();
    var matches = [];
    for (var i = 0; i < allStories.length; i++) {
        var s = allStories[i];
        if (s.title.toLowerCase().includes(q) ||
            (s.content && s.content.toLowerCase().includes(q))) {
            matches.push(s);
        }
    }

    var container = document.querySelector('.search-suggestions');
    if (!container) {
        container = document.createElement('div');
        container.className = 'search-suggestions';
        document.querySelector('.search-container').appendChild(container);
    }

    if (matches.length === 0) {
        container.innerHTML = '<div class="search-no-result">没有找到匹配结果</div>';
        container.classList.add('active');
        return;
    }

    var maxShow = 8;
    var itemsHtml = '';
    var escapedQ = escapeRegExp(q);
    var regex = new RegExp(escapedQ, 'gi');

    for (var i = 0; i < Math.min(matches.length, maxShow); i++) {
        var s = matches[i];
        var catName = getCategoryName(s._category);
        var highlightedTitle = s.title.replace(regex, function(match) {
            return '<span class="highlight">' + match + '</span>';
        });
        itemsHtml += '<div class="search-suggestion-item" data-id="' + s.id + '" data-branch="' + s._category + '">';
        itemsHtml += highlightedTitle;
        if (catName) {
            itemsHtml += ' <span class="search-suggestion-tag">' + catName + '</span>';
        }
        itemsHtml += '</div>';
    }

    if (matches.length > maxShow) {
        container.innerHTML = itemsHtml + '<div class="search-no-result">还有 ' + (matches.length - maxShow) + ' 个结果……</div>';
    } else {
        container.innerHTML = itemsHtml;
    }

    container.classList.add('active');

    var items = container.querySelectorAll('.search-suggestion-item');
    for (var i = 0; i < items.length; i++) {
        (function(el) {
            el.addEventListener('click', function() {
                hideSuggestions();
                searchInput.value = '';
                searchClear.classList.remove('visible');
                state.searchQuery = '';
                renderStoryDetail(el.dataset.id, el.dataset.branch);
            });
        })(items[i]);
    }
}

function hideSuggestions() {
    var el = document.querySelector('.search-suggestions');
    if (el) el.classList.remove('active');
}

/* ================================================ */
/* ===== 事件绑定 ===== */
/* ================================================ */

// 菜单点击
for (var i = 0; i < menuItems.length; i++) {
    (function(item) {
        item.addEventListener('click', function(e) {
            // 点击高中故事本身不触发子菜单
            switchSection(item.dataset.section);
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    })(menuItems[i]);
}

// 子菜单点击（高中故事分支）
for (var i = 0; i < submenuItems.length; i++) {
    (function(item) {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            var branch = item.dataset.branch;
            state.currentBranch = branch;
            state.searchQuery = '';
            searchInput.value = '';
            searchClear.classList.remove('visible');
            hideSuggestions();

            // 切换到高中故事板块
            switchSection('stories');
            state.currentBranch = branch;
            updateSubmenuActive(branch);
            renderStoryList({ branch: branch });
        });
    })(submenuItems[i]);
}

// 来时路子菜单点击
document.querySelectorAll('[data-lailu]').forEach(function(item) {
    item.addEventListener('click', function(e) {
        e.stopPropagation();
        var gradeKey = item.dataset.lailu;
        // 切换到来时路板块
        if (state.currentSection !== 'lailu') {
            switchSection('lailu');
            // 用 setTimeout 等 DOM 渲染完再跳转
            setTimeout(function() { renderLailuGrade(gradeKey); }, 50);
        } else {
            renderLailuGrade(gradeKey);
        }
    });
});

// 搜索输入
var searchTimer;
searchInput.addEventListener('input', function() {
    var val = searchInput.value.trim();
    if (val.length > 0) {
        searchClear.classList.add('visible');
    } else {
        searchClear.classList.remove('visible');
    }

    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
        if (val) {
            showSuggestions(val);
            performSearch(val);
        } else {
            hideSuggestions();
            performSearch('');
        }
    }, 100);
});

// 搜索回车
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        hideSuggestions();
        var val = searchInput.value.trim();
        performSearch(val);
    }
});

// 搜索清空
searchClear.addEventListener('click', function() {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    hideSuggestions();
    performSearch('');
    searchInput.focus();
});

// 点击外部关闭搜索建议
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
        hideSuggestions();
    }
});

// 移动端菜单开关
menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
});

// ESC 关闭
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        hideSuggestions();
        searchInput.blur();
    }
});

/* ===== 启动 ===== */
switchSection('stories');
showWelcome();

console.log('📖 三年记忆 · 高中纪念网站已加载');
var total = flattenStories().length;
console.log('📚 共 ' + total + ' 个故事');

/* ===== 学姐高三纪录片 ===== */
function renderDocumentary() {
    var imgPath = '学姐高三纪录片.jpg';

    content.innerHTML =
        '<div class="section-header">' +
        '<h1>🎬 学姐高三纪录片</h1>' +
        '<p>海报中的二维码可以扫码观看</p>' +
        '</div>' +
        '<div class="documentary-viewer">' +
        '<div class="documentary-image-wrapper">' +
        '<img class="documentary-image" src="' + imgPath + '" alt="学姐高三纪录片海报" id="docImg">' +
        '</div>' +
        '</div>';
}

/* ===== 2026高中毕业纪念册 ===== */
function renderYearbook() {
    renderBookViewer("2026高中毕业纪念册", "📕", "共28页 | 已旋转为横版浏览", "pages_yearbook", 28);
}

/* ===== 高一作文集 ===== */
function renderEssays() {
    renderBookViewer("高一作文集", "📝", "共36页", "pages_essays", 36);
}
