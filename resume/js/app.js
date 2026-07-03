/**
 * 简历编辑器 - 主逻辑
 * 逆向自 lgdsunday.club
 */

// 字段标签映射 - 逆向自原站
const G1 = {
    name: { label: '姓名', unit: '' },
    gender: { label: '性别', unit: '' },
    phone: { label: '电话', unit: '' },
    email: { label: '邮箱', unit: '' },
    avatar: { label: '简历照片', unit: '' },
    salary: { label: '期望薪资', unit: '/月' },
    birthday: { label: '出生日期', unit: '' },
    workHours: { label: '工作年限', unit: '经验' },
    nativePlace: { label: '籍贯', unit: '' },
    politicalStatus: { label: '政治面貌', unit: '' },
    jobIntention: { label: '求职意向', unit: '' },
    cityIntention: { label: '期望城市', unit: '' },
    entryTime: { label: '到岗时间', unit: '' }
};

// A4页面常量
const A4_HEIGHT = 1123;
const MIN_LINE_SPACING = 8;
const MIN_MODULE_SPACING = 12;
const SPACING_STEP = 2;

// 全局状态
let currentTemplate = 'simplicity';
let currentZoom = 1;
let autoFitTimer = null;

// 模块名称映射
const MODULE_NAMES = {
    base: '基本信息',
    job: '求职意向',
    education: '教育背景',
    work: '工作经验',
    campus: '校园经历',
    skill: '技能特长',
    certificate: '荣誉证书',
    selfEvaluation: '自我评价',
    project: '项目经历',
    internship: '实习经历'
};

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    initToolbarTabs();
    initEventListeners();
    switchTemplate(currentTemplate);
    renderAll();
});

// ============================================
// 工具栏标签初始化
// ============================================
function initToolbarTabs() {
    const tabsContainer = document.getElementById('toolbar-tabs');
    const sortedData = ResumeStore.getSortedItemData();

    tabsContainer.innerHTML = sortedData.map(item => `
        <button type="button" class="tab-btn" data-mkey="${item.mKey}" onclick="openEditor('${item.mKey}')">
            ${MODULE_NAMES[item.mKey] || item.mKey}
        </button>
    `).join('');
}

// ============================================
// 打开编辑器
// ============================================
window.openEditor = function(mKey) {
    // 更新标签状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mkey === mKey);
    });

    // 展开底部工具栏
    document.getElementById('bottom-toolbar').classList.add('expanded');

    // 打开编辑弹窗
    if (window.editorPopup) {
        window.editorPopup.switchTab(mKey);
    }
};

// ============================================
// 数据持久化
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('resume_store');
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                if (key === 'baseInfo' || key === 'jobInfo' || key === 'otherData') {
                    Object.assign(ResumeStore[key], data[key]);
                } else if (Array.isArray(data[key])) {
                    ResumeStore[key] = data[key];
                } else if (typeof data[key] !== 'function') {
                    ResumeStore[key] = data[key];
                }
            });

            // 恢复模板
            if (data.templateName) {
                currentTemplate = data.templateName;
            }
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
}

function saveData() {
    try {
        const data = {
            templateName: currentTemplate,
            baseInfo: { ...ResumeStore.baseInfo },
            addBaseInfo: [...ResumeStore.addBaseInfo],
            jobInfo: { ...ResumeStore.jobInfo },
            education: [...ResumeStore.education],
            work: [...ResumeStore.work],
            campus: [...ResumeStore.campus],
            skill: ResumeStore.skill,
            certificate: ResumeStore.certificate,
            selfEvaluation: ResumeStore.selfEvaluation,
            project: [...ResumeStore.project],
            internship: [...ResumeStore.internship],
            fontSize: ResumeStore.fontSize,
            moduleSpacing: ResumeStore.moduleSpacing,
            lineSpacing: ResumeStore.lineSpacing,
            pageMargin: ResumeStore.pageMargin,
            themeColor: ResumeStore.themeColor,
            itemData: ResumeStore.itemData.map(item => ({ ...item })),
            otherData: { ...ResumeStore.otherData }
        };
        localStorage.setItem('resume_store', JSON.stringify(data));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

let saveTimer = null;
window.saveData = function debounceSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveData, 500);
};

// ============================================
// 渲染函数
// ============================================
window.renderAll = function renderAll() {
    renderBasicPreview();
    renderJobPreview();
    renderEducationPreview();
    renderWorkPreview();
    renderCampusPreview();
    renderSkillPreview();
    renderCertificatePreview();
    renderSelfEvaluationPreview();
    renderProjectPreview();
    renderInternshipPreview();
    applySpacingStyles();
    updateEmptyState();
};

function applySpacingStyles() {
    const lineHeight = Math.max(16, ResumeStore.lineSpacing + 12);

    document.querySelectorAll('.resume-mode__row').forEach(el => {
        el.style.marginBottom = `${ResumeStore.lineSpacing}px`;
    });

    document.querySelectorAll('.resume-mode').forEach(el => {
        el.style.marginTop = `${ResumeStore.moduleSpacing}px`;
    });

    document.querySelectorAll('.resume-mode__content').forEach(el => {
        el.style.lineHeight = `${lineHeight}px`;
    });

    const previewEl = document.getElementById('resume-preview');
    if (previewEl) {
        previewEl.style.fontSize = `${ResumeStore.fontSize}px`;
    }
}

function renderBasicPreview() {
    const base = ResumeStore.baseInfo;

    document.getElementById('preview-name').textContent = base.name || '你的姓名';
    document.getElementById('preview-title').textContent = ResumeStore.jobInfo.jobIntention || '';

    // 构建基本信息网格
    const baseInfo = ResumeStore.getBaseInfo();
    let gridHTML = '';
    for (const [key, value] of Object.entries(baseInfo)) {
        if (value && value !== '不填') {
            const label = G1[key]?.label || key;
            const unit = G1[key]?.unit || '';
            gridHTML += `
                <div class="info-item">
                    <span class="info-label">${label}：</span>
                    <span class="info-value">${value}${unit}</span>
                </div>
            `;
        }
    }
    document.getElementById('preview-contact').innerHTML = gridHTML;

    // 头像
    const avatarContainer = document.getElementById('preview-avatar');
    if (avatarContainer) {
        if (ResumeStore.otherData.showAvatar && (base.avatar || base.gender)) {
            avatarContainer.style.display = 'block';
            const avatarImg = avatarContainer.querySelector('img');
            if (avatarImg) {
                avatarImg.src = ResumeStore.getAvatarPath();
            }
        } else {
            avatarContainer.style.display = 'none';
        }
    }
}

function renderJobPreview() {
    const jobModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'job');
    const section = document.getElementById('section-job');
    const container = document.getElementById('preview-job');

    if (!section || !container) return;

    const job = ResumeStore.jobInfo;
    const hasData = job.jobIntention || job.cityIntention || job.salary || job.entryTime;

    if (!jobModule?.props?.isShow || !hasData) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    const fields = [];
    if (job.jobIntention) fields.push(`<span>求职意向：${job.jobIntention}</span>`);
    if (job.cityIntention) fields.push(`<span>期望城市：${job.cityIntention}</span>`);
    if (job.salary) fields.push(`<span>期望薪资：${job.salary}</span>`);
    if (job.entryTime) fields.push(`<span>到岗时间：${job.entryTime}</span>`);

    container.innerHTML = `<div class="job-info-grid">${fields.join('')}</div>`;
}

function renderEducationPreview() {
    const eduModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'education');
    const section = document.getElementById('section-education');
    const container = document.getElementById('preview-education');
    const education = ResumeStore.education || [];

    if (!section || !container) return;

    if (!eduModule?.props?.isShow || education.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = education.map(edu => `
        <div class="resume-mode" data-mkey="education">
            <div class="resume-mode__row">
                <span class="resume-mode__date">${formatDateRange(edu.startDate, edu.endDate, edu.isNow)}</span>
                <span class="resume-mode__company">${edu.title || '学校名称'}</span>
                <span class="resume-mode__desc">${edu.degree || ''}</span>
            </div>
            ${edu.desc ? `<div class="resume-mode__content">专业：${edu.desc}</div>` : ''}
            ${edu.content ? `<div class="resume-mode__content">${edu.content}</div>` : ''}
        </div>
    `).join('');
}

function renderWorkPreview() {
    const workModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'work');
    const section = document.getElementById('section-work');
    const container = document.getElementById('preview-work');
    const work = ResumeStore.work || [];

    if (!section || !container) return;

    if (!workModule?.props?.isShow || work.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = work.map(w => `
        <div class="resume-mode" data-mkey="work">
            <div class="resume-mode__row">
                <span class="resume-mode__date">${formatDateRange(w.startDate, w.endDate, w.isNow)}</span>
                <span class="resume-mode__company">${w.title || '公司名称'}</span>
                <span class="resume-mode__desc">${w.desc || ''}</span>
            </div>
            ${w.content ? `<div class="resume-mode__content">${w.content}</div>` : ''}
        </div>
    `).join('');
}

function renderCampusPreview() {
    const campusModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'campus');
    const section = document.getElementById('section-campus');
    const container = document.getElementById('preview-campus');
    const campus = ResumeStore.campus || [];

    if (!section || !container) return;

    if (!campusModule?.props?.isShow || campus.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = campus.map(c => `
        <div class="resume-mode" data-mkey="campus">
            <div class="resume-mode__row">
                <span class="resume-mode__date">${formatDateRange(c.startDate, c.endDate, c.isNow)}</span>
                <span class="resume-mode__company">${c.title || '经历名称'}</span>
                <span class="resume-mode__desc">${c.desc || ''}</span>
            </div>
            ${c.content ? `<div class="resume-mode__content">${c.content}</div>` : ''}
        </div>
    `).join('');
}

function renderSkillPreview() {
    const skillModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'skill');
    const section = document.getElementById('section-skill');
    const container = document.getElementById('preview-skill');

    if (!section || !container) return;

    if (!skillModule?.props?.isShow || !ResumeStore.skill) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = `<div class="resume-mode__content">${ResumeStore.skill}</div>`;
}

function renderCertificatePreview() {
    const certModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'certificate');
    const section = document.getElementById('section-certificate');
    const container = document.getElementById('preview-certificate');

    if (!section || !container) return;

    if (!certModule?.props?.isShow || !ResumeStore.certificate) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = `<div class="resume-mode__content">${ResumeStore.certificate}</div>`;
}

function renderSelfEvaluationPreview() {
    const evalModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'selfEvaluation');
    const section = document.getElementById('section-selfEvaluation');
    const container = document.getElementById('preview-selfEvaluation');

    if (!section || !container) return;

    if (!evalModule?.props?.isShow || !ResumeStore.selfEvaluation) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = `<div class="resume-mode__content">${ResumeStore.selfEvaluation}</div>`;
}

function renderProjectPreview() {
    const projModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'project');
    const section = document.getElementById('section-project');
    const container = document.getElementById('preview-project');
    const project = ResumeStore.project || [];

    if (!section || !container) return;

    if (!projModule?.props?.isShow || project.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = project.map(p => `
        <div class="resume-mode" data-mkey="project">
            <div class="resume-mode__row">
                <span class="resume-mode__date">${formatDateRange(p.startDate, p.endDate, p.isNow)}</span>
                <span class="resume-mode__company">${p.title || '项目名称'}</span>
                <span class="resume-mode__desc">${p.desc || ''}</span>
            </div>
            ${p.content ? `<div class="resume-mode__content">${p.content}</div>` : ''}
        </div>
    `).join('');
}

function renderInternshipPreview() {
    const internModule = ResumeStore.getSortedItemData().find(i => i.mKey === 'internship');
    const section = document.getElementById('section-internship');
    const container = document.getElementById('preview-internship');
    const internship = ResumeStore.internship || [];

    if (!section || !container) return;

    if (!internModule?.props?.isShow || internship.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    updateSectionTheme(section);

    container.innerHTML = internship.map(i => `
        <div class="resume-mode" data-mkey="internship">
            <div class="resume-mode__row">
                <span class="resume-mode__date">${formatDateRange(i.startDate, i.endDate, i.isNow)}</span>
                <span class="resume-mode__company">${i.title || '公司名称'}</span>
                <span class="resume-mode__desc">${i.desc || ''}</span>
            </div>
            ${i.content ? `<div class="resume-mode__content">${i.content}</div>` : ''}
        </div>
    `).join('');
}

// 更新模块主题颜色
function updateSectionTheme(section) {
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    const iconEl = section.querySelector('.tit_icon');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;
    if (iconEl) iconEl.style.backgroundColor = ResumeStore.themeColor;
}

function updateEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const hasData = ResumeStore.baseInfo.name ||
                    ResumeStore.education.length > 0 ||
                    ResumeStore.work.length > 0;

    if (emptyState) {
        emptyState.style.display = hasData ? 'none' : 'flex';
    }
}

// ============================================
// 事件监听
// ============================================
function initEventListeners() {
    // 底部工具栏展开/收起
    document.getElementById('toolbar-toggle').addEventListener('click', () => {
        document.getElementById('bottom-toolbar').classList.toggle('expanded');
    });

    // 间距设置
    document.getElementById('line-spacing').addEventListener('input', (e) => {
        ResumeStore.lineSpacing = parseInt(e.target.value);
        document.getElementById('line-spacing-value').textContent = ResumeStore.lineSpacing;
        applySpacingStyles();
        renderAll();
        window.saveData();
    });

    document.getElementById('module-spacing').addEventListener('input', (e) => {
        ResumeStore.moduleSpacing = parseInt(e.target.value);
        document.getElementById('module-spacing-value').textContent = ResumeStore.moduleSpacing;
        applySpacingStyles();
        renderAll();
        window.saveData();
    });

    document.getElementById('font-size').addEventListener('input', (e) => {
        ResumeStore.fontSize = parseInt(e.target.value);
        document.getElementById('font-size-value').textContent = ResumeStore.fontSize;
        applySpacingStyles();
        renderAll();
        window.saveData();
    });

    // 自动调整按钮
    document.getElementById('btn-auto-fit').addEventListener('click', autoFitToOnePage);

    // 重置间距按钮
    document.getElementById('btn-reset-spacing').addEventListener('click', () => {
        ResumeStore.lineSpacing = 12;
        ResumeStore.moduleSpacing = 20;
        ResumeStore.fontSize = 14;
        document.getElementById('line-spacing').value = 12;
        document.getElementById('module-spacing').value = 20;
        document.getElementById('font-size').value = 14;
        document.getElementById('line-spacing-value').textContent = '12';
        document.getElementById('module-spacing-value').textContent = '20';
        document.getElementById('font-size-value').textContent = '14';
        applySpacingStyles();
        renderAll();
        window.saveData();
    });

    // 导出PDF
    document.getElementById('btn-export-pdf').addEventListener('click', handleExportPDF);

    // 导出JSON
    document.getElementById('btn-export-json').addEventListener('click', handleExportJSON);

    // 导入JSON
    document.getElementById('btn-import').addEventListener('click', () => {
        document.getElementById('import-input').click();
    });
    document.getElementById('import-input').addEventListener('change', handleImportJSON);

    // 点击简历区域打开编辑
    document.querySelectorAll('[data-mkey]').forEach(el => {
        el.addEventListener('click', (e) => {
            const mKey = el.dataset.mkey;
            if (mKey) {
                openEditor(mKey);
            }
        });
    });
}

// ============================================
// 模板切换
// ============================================
window.switchTemplate = function(templateName) {
    currentTemplate = templateName;

    // 更新按钮状态
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.template === templateName);
    });

    // 更新样式表
    const templateLink = document.getElementById('template-style');
    if (templateLink) {
        templateLink.href = `./css/templates/${templateName}.css`;
    }

    // 更新预览元素类名
    const previewEl = document.getElementById('resume-preview');
    if (previewEl) {
        previewEl.className = `a4-page ${templateName}`;
    }

    window.saveData();

    setTimeout(renderAll, 100);
};

// ============================================
// 自动分页
// ============================================
async function autoFitToOnePage() {
    if (autoFitTimer) {
        clearInterval(autoFitTimer);
    }

    const resumeEl = document.getElementById('resume');
    if (!resumeEl) return;

    if (resumeEl.offsetHeight <= A4_HEIGHT) {
        showMessage('内容已在单页内', 'success');
        return;
    }

    showMessage('正在自动调整...', 'info');

    autoFitTimer = setInterval(() => {
        const currentHeight = resumeEl.offsetHeight;

        if (currentHeight <= A4_HEIGHT) {
            clearInterval(autoFitTimer);
            autoFitTimer = null;
            showMessage('已调整为单页', 'success');
            updateSliders();
            return;
        }

        if (ResumeStore.lineSpacing <= MIN_LINE_SPACING &&
            ResumeStore.moduleSpacing <= MIN_MODULE_SPACING) {
            clearInterval(autoFitTimer);
            autoFitTimer = null;
            showMessage('自动调整失败，内容无法缩减到1页', 'error');
            updateSliders();
            return;
        }

        if (ResumeStore.lineSpacing - SPACING_STEP >= MIN_LINE_SPACING) {
            ResumeStore.lineSpacing -= SPACING_STEP;
        }

        if (ResumeStore.moduleSpacing - SPACING_STEP >= MIN_MODULE_SPACING) {
            ResumeStore.moduleSpacing -= SPACING_STEP;
        }

        applySpacingStyles();
        renderAll();
    }, 200);
}

function updateSliders() {
    document.getElementById('line-spacing').value = ResumeStore.lineSpacing;
    document.getElementById('module-spacing').value = ResumeStore.moduleSpacing;
    document.getElementById('line-spacing-value').textContent = ResumeStore.lineSpacing;
    document.getElementById('module-spacing-value').textContent = ResumeStore.moduleSpacing;
}

// ============================================
// 导入导出
// ============================================
async function handleExportPDF() {
    const name = ResumeStore.baseInfo.name || '简历';
    showMessage('正在生成PDF...', 'info');

    if (window.html2pdf) {
        const element = document.getElementById('resume-preview');
        const opt = {
            margin: 0,
            filename: `${name}_简历.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
            showMessage('PDF导出成功', 'success');
        } catch (e) {
            showMessage('PDF导出失败', 'error');
        }
    }
}

function handleExportJSON() {
    const name = ResumeStore.baseInfo.name || '简历';
    saveData();
    const data = localStorage.getItem('resume_store');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_简历数据.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        Object.keys(data).forEach(key => {
            if (key === 'baseInfo' || key === 'jobInfo' || key === 'otherData') {
                Object.assign(ResumeStore[key], data[key]);
            } else if (Array.isArray(data[key])) {
                ResumeStore[key] = data[key];
            } else if (typeof data[key] !== 'function') {
                ResumeStore[key] = data[key];
            }
        });

        saveData();
        initToolbarTabs();
        renderAll();
        showMessage('导入成功！', 'success');
    } catch (error) {
        showMessage('导入失败：无效的JSON文件', 'error');
    }

    e.target.value = '';
}

// ============================================
// 工具函数
// ============================================
function formatDateRange(startDate, endDate, isNow) {
    if (!startDate) return '';
    const start = formatDate(startDate);
    const end = isNow ? '至今' : (endDate ? formatDate(endDate) : '');
    return end ? `${start} - ${end}` : start;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    return `${year}.${month}`;
}

function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
