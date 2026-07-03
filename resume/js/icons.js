/**
 * SVG图标模块 - 逆向自 lgdsunday.club
 * 使用原站的SVG图标
 */

const ResumeIcons = {
    // 基本信息图标
    base: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M512 512a192 192 0 100-384 192 192 0 000 384zm0 64c-106.67 0-320 53.33-320 160v64h640v-64c0-106.67-213.33-160-320-160z"/>
    </svg>`,

    // 求职意向图标
    job: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-40 824H232V136h560v752zM484 328a40 40 0 1080 0 40 40 0 00-80 0zm0 200a40 40 0 1080 0 40 40 0 00-80 0zm-160-100a40 40 0 1080 0 40 40 0 00-80 0zm0 200a40 40 0 1080 0 40 40 0 00-80 0zm320-200a40 40 0 1080 0 40 40 0 00-80 0zm0 200a40 40 0 1080 0 40 40 0 00-80 0z"/>
    </svg>`,

    // 教育背景图标
    education: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M512 128L64 448l448 320 448-320L512 128zm0 64l352 224-352 224L160 448 512 192zM128 576v192l384 256 384-256V576l-384 224L128 576z"/>
    </svg>`,

    // 工作经验图标
    work: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-40 824H232V136h560v752zM288 200h448v48H288v-48zm0 120h448v48H288v-48zm0 120h448v48H288v-48zm0 120h304v48H288v-48z"/>
    </svg>`,

    // 校园经历图标
    campus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M512 128L64 448l448 320 448-320L512 128zm0 64l352 224-352 224L160 448 512 192zM128 576v192l384 256 384-256V576l-384 224L128 576zM768 256a64 64 0 110 128 64 64 0 010-128z"/>
    </svg>`,

    // 技能特长图标
    skill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm-40-428h80v200h-80V456zm0-120h80v48h-80v-48z"/>
    </svg>`,

    // 荣誉证书图标
    certificate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-40 824H232V136h560v752zM512 320a64 64 0 110 128 64 64 0 010-128zm0 200c-53 0-96 43-96 96v104h192V616c0-53-43-96-96-96z"/>
    </svg>`,

    // 自我评价图标
    selfEvaluation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm-40-428h80v200h-80V456zm0-120h80v48h-80v-48z"/>
    </svg>`,

    // 项目经历图标
    project: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656zM484 328a40 40 0 1080 0 40 40 0 00-80 0zm0 200a40 40 0 1080 0 40 40 0 00-80 0zm-160-100a40 40 0 1080 0 40 40 0 00-80 0zm0 200a40 40 0 1080 0 40 40 0 00-80 0zm320-200a40 40 0 1080 0 40 40 0 00-80 0zm0 200a40 40 0 1080 0 40 40 0 00-80 0z"/>
    </svg>`,

    // 实习经历图标
    internship: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-40 824H232V136h560v752zM288 200h448v48H288v-48zm0 120h448v48H288v-48zm0 120h448v48H288v-48zm0 120h304v48H288v-48z"/>
    </svg>`,

    // 获取图标HTML
    getIcon(mKey) {
        return this[mKey] || '';
    },

    // 获取模块标题HTML（带图标的箭头标签）
    getTitleHTML(mKey, title, themeColor = '#4e7282') {
        return `
            <div class="resume-mode__title">
                <div class="module_tit" style="color: #fff">
                    <span style="background-color: ${themeColor}">${title}</span>
                    <div class="tit_icon" style="background-color: ${themeColor}"><i></i></div>
                    <dfn style="border-top-color: ${themeColor}"></dfn>
                </div>
            </div>
        `;
    }
};

// 导出
window.ResumeIcons = ResumeIcons;
