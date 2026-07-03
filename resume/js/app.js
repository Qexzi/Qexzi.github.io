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

// ============================================
// A4页面常量 - 与原站一致
// ============================================
const A4_HEIGHT = 1123; // A4高度 (297mm @ 96dpi)
const MIN_LINE_SPACING = 8;
const MIN_MODULE_SPACING = 12;
const SPACING_STEP = 2;

// ============================================
// 全局状态
// ============================================
let currentTemplate = 'simplicity';
let currentZoom = 1;
let autoFitTimer = null;
let resizeObserver = null;

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 加载保存的数据
    loadSavedData();

    // 初始化事件监听
    initEventListeners();

    // 初始化 ResizeObserver
    initResizeObserver();

    // 应用模板和缩放
    switchTemplate(currentTemplate);
    applyZoom(currentZoom);

    // 渲染初始内容
    renderAll();
});

// ============================================
// 数据持久化
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('resume_store');
        if (saved) {
            const data = JSON.parse(saved);
            // 合并数据到ResumeStore
            Object.keys(data).forEach(key => {
                if (key === 'baseInfo' || key === 'jobInfo' || key === 'otherData') {
                    Object.assign(ResumeStore[key], data[key]);
                } else if (Array.isArray(data[key])) {
                    ResumeStore[key] = data[key];
                } else if (typeof data[key] !== 'function') {
                    ResumeStore[key] = data[key];
                }
            });
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
}

function saveData() {
    try {
        const data = {
            resumeId: ResumeStore.resumeId,
            resumeName: ResumeStore.resumeName,
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

// 防抖保存
let saveTimer = null;
window.saveData = function debounceSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveData, 500);
};

// ============================================
// ResizeObserver - 监听内容变化
// ============================================
function initResizeObserver() {
    const resumeEl = document.getElementById('resume');

    const debouncedUpdate = debounce(updateResumeHeight, 200);

    resizeObserver = new ResizeObserver(() => {
        debouncedUpdate();
    });

    if (resumeEl) {
        resizeObserver.observe(resumeEl);
    }
}

function updateResumeHeight() {
    const resumeEl = document.getElementById('resume');
    if (!resumeEl) return;

    const height = resumeEl.offsetHeight;
    updatePageCount(height);
}

function updatePageCount(height) {
    const pages = Math.ceil(height / A4_HEIGHT);
    const statusEl = document.getElementById('page-status');

    if (statusEl) {
        if (pages <= 1) {
            statusEl.innerHTML = '<span class="status-ok">✅ 内容适配单页</span>';
        } else {
            statusEl.innerHTML = `<span class="status-warning">⚠️ 当前 ${pages} 页</span>`;
        }
    }
}

// ============================================
// 自动分页算法 - 逆向自原站
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

    // 使用 setInterval 每200ms检查一次 - 与原站逻辑一致
    autoFitTimer = setInterval(() => {
        const currentHeight = resumeEl.offsetHeight;

        if (currentHeight <= A4_HEIGHT) {
            clearInterval(autoFitTimer);
            autoFitTimer = null;
            showMessage('已调整为单页', 'success');
            updateResumeHeight();
            return;
        }

        if (ResumeStore.lineSpacing <= MIN_LINE_SPACING &&
            ResumeStore.moduleSpacing <= MIN_MODULE_SPACING) {
            clearInterval(autoFitTimer);
            autoFitTimer = null;
            showMessage('自动调整失败，内容无法缩减到1页', 'error');
            updateResumeHeight();
            return;
        }

        if (ResumeStore.lineSpacing - SPACING_STEP >= MIN_LINE_SPACING) {
            ResumeStore.lineSpacing -= SPACING_STEP;
        }

        if (ResumeStore.moduleSpacing - SPACING_STEP >= MIN_MODULE_SPACING) {
            ResumeStore.moduleSpacing -= SPACING_STEP;
        }

        // 更新滑块值
        const lineSlider = document.getElementById('line-spacing');
        const moduleSlider = document.getElementById('module-spacing');
        if (lineSlider) lineSlider.value = ResumeStore.lineSpacing;
        if (moduleSlider) moduleSlider.value = ResumeStore.moduleSpacing;

        applySpacingStyles();
        renderAll();
    }, 200);
}

// ============================================
// 应用样式
// ============================================
function applySpacingStyles() {
    const lineHeight = Math.max(16, ResumeStore.lineSpacing + 12);

    // 行间距
    document.querySelectorAll('.resume-mode__row').forEach(el => {
        el.style.marginBottom = `${ResumeStore.lineSpacing}px`;
    });

    // 模块间距
    document.querySelectorAll('.resume-mode').forEach(el => {
        el.style.marginTop = `${ResumeStore.moduleSpacing}px`;
    });

    // 内容行高
    document.querySelectorAll('.resume-mode__content').forEach(el => {
        el.style.lineHeight = `${lineHeight}px`;
    });

    // 字体大小
    const previewEl = document.getElementById('resume-preview');
    if (previewEl) {
        previewEl.style.fontSize = `${ResumeStore.fontSize}px`;
    }

    // 页面边距
    document.querySelectorAll('.resume-section').forEach(el => {
        el.style.padding = `0 ${ResumeStore.pageMargin}px`;
    });
}

// ============================================
// 渲染函数
// ============================================
window.renderAll = function renderAll() {
    renderBasicPreview();
    renderJobPreview();
    renderEducationPreview();
    renderWorkPreview();
    renderProjectPreview();
    renderSkillPreview();
    renderCertificatePreview();
    renderSelfEvaluationPreview();
    applySpacingStyles();
    updateEmptyState();
};

function renderBasicPreview() {
    const base = ResumeStore.baseInfo;
    const sortedData = ResumeStore.getSortedItemData();
    const baseModule = sortedData.find(i => i.mKey === 'base');

    // 名称
    document.getElementById('preview-name').textContent = base.name || '你的姓名';

    // 求职意向
    const jobIntention = ResumeStore.jobInfo.jobIntention || '';
    document.getElementById('preview-title').textContent = jobIntention;

    // 联系信息 - 使用原站格式
    const contactItems = [];
    if (base.phone) contactItems.push(`<span class="info-value">${base.phone}</span>`);
    if (base.email) contactItems.push(`<span class="info-value">${base.email}</span>`);
    if (base.nativePlace) contactItems.push(`<span class="info-value">${base.nativePlace}</span>`);

    // 构建基本信息网格 - 与原站一致
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

    document.getElementById('preview-contact').innerHTML = gridHTML || contactItems.join('');

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

    // 基本信息模块显示/隐藏
    const sectionInfo = document.getElementById('section-info');
    if (sectionInfo && baseModule) {
        sectionInfo.style.display = baseModule.props.isShow ? 'block' : 'none';
    }
}

function renderJobPreview() {
    const sortedData = ResumeStore.getSortedItemData();
    const jobModule = sortedData.find(i => i.mKey === 'job');
    const section = document.getElementById('section-job');

    if (!section) return;

    if (!jobModule || !jobModule.props.isShow) {
        section.style.display = 'none';
        return;
    }

    const job = ResumeStore.jobInfo;
    const hasData = job.jobIntention || job.cityIntention || job.salary || job.entryTime;

    if (!hasData) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    const container = document.getElementById('preview-job');
    if (container) {
        const fields = [];
        if (job.jobIntention) fields.push(`<span>求职意向：${job.jobIntention}</span>`);
        if (job.cityIntention) fields.push(`<span>期望城市：${job.cityIntention}</span>`);
        if (job.salary) fields.push(`<span>期望薪资：${job.salary}</span>`);
        if (job.entryTime) fields.push(`<span>到岗时间：${job.entryTime}</span>`);

        container.innerHTML = `<div class="job-info-grid">${fields.join('')}</div>`;
    }
}

function renderEducationPreview() {
    const sortedData = ResumeStore.getSortedItemData();
    const eduModule = sortedData.find(i => i.mKey === 'education');
    const section = document.getElementById('section-education');
    const container = document.getElementById('preview-education');
    const education = ResumeStore.education || [];

    if (!section || !container) return;

    if (!eduModule || !eduModule.props.isShow || education.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    container.innerHTML = education.map(edu => `
        <div class="resume-mode" data-mkey="education" style="margin-top: ${ResumeStore.moduleSpacing}px">
            <div class="resume-mode__row" style="margin-bottom: ${ResumeStore.lineSpacing}px">
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
    const sortedData = ResumeStore.getSortedItemData();
    const workModule = sortedData.find(i => i.mKey === 'work');
    const section = document.getElementById('section-work');
    const container = document.getElementById('preview-work');
    const work = ResumeStore.work || [];

    if (!section || !container) return;

    if (!workModule || !workModule.props.isShow || work.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    container.innerHTML = work.map(w => `
        <div class="resume-mode" data-mkey="work" style="margin-top: ${ResumeStore.moduleSpacing}px">
            <div class="resume-mode__row" style="margin-bottom: ${ResumeStore.lineSpacing}px">
                <span class="resume-mode__date">${formatDateRange(w.startDate, w.endDate, w.isNow)}</span>
                <span class="resume-mode__company">${w.title || '公司名称'}</span>
                <span class="resume-mode__desc">${w.desc || ''}</span>
            </div>
            ${w.content ? `<div class="resume-mode__content">${w.content}</div>` : ''}
        </div>
    `).join('');
}

function renderProjectPreview() {
    const sortedData = ResumeStore.getSortedItemData();
    const projModule = sortedData.find(i => i.mKey === 'project');
    const section = document.getElementById('section-project');
    const container = document.getElementById('preview-project');
    const project = ResumeStore.project || [];

    if (!section || !container) return;

    if (!projModule || !projModule.props.isShow || project.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    container.innerHTML = project.map(p => `
        <div class="resume-mode" data-mkey="project" style="margin-top: ${ResumeStore.moduleSpacing}px">
            <div class="resume-mode__row" style="margin-bottom: ${ResumeStore.lineSpacing}px">
                <span class="resume-mode__date">${formatDateRange(p.startDate, p.endDate, p.isNow)}</span>
                <span class="resume-mode__company">${p.title || '项目名称'}</span>
                <span class="resume-mode__desc">${p.desc || ''}</span>
            </div>
            ${p.content ? `<div class="resume-mode__content">${p.content}</div>` : ''}
        </div>
    `).join('');
}

function renderSkillPreview() {
    const sortedData = ResumeStore.getSortedItemData();
    const skillModule = sortedData.find(i => i.mKey === 'skill');
    const section = document.getElementById('section-skill');
    const container = document.getElementById('preview-skill');

    if (!section || !container) return;

    if (!skillModule || !skillModule.props.isShow || !ResumeStore.skill) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    container.innerHTML = `<div class="resume-mode__content">${ResumeStore.skill}</div>`;
}

function renderCertificatePreview() {
    const sortedData = ResumeStore.getSortedItemData();
    const certModule = sortedData.find(i => i.mKey === 'certificate');
    const section = document.getElementById('section-certificate');
    const container = document.getElementById('preview-certificate');

    if (!section || !container) return;

    if (!certModule || !certModule.props.isShow || !ResumeStore.certificate) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    container.innerHTML = `<div class="resume-mode__content">${ResumeStore.certificate}</div>`;
}

function renderSelfEvaluationPreview() {
    const sortedData = ResumeStore.getSortedItemData();
    const evalModule = sortedData.find(i => i.mKey === 'selfEvaluation');
    const section = document.getElementById('section-selfEvaluation');
    const container = document.getElementById('preview-selfEvaluation');

    if (!section || !container) return;

    if (!evalModule || !evalModule.props.isShow || !ResumeStore.selfEvaluation) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    // 更新标题颜色
    const titleEl = section.querySelector('.module_tit span');
    const dfnEl = section.querySelector('.module_tit dfn');
    if (titleEl) titleEl.style.backgroundColor = ResumeStore.themeColor;
    if (dfnEl) dfnEl.style.borderTopColor = ResumeStore.themeColor;

    container.innerHTML = `<div class="resume-mode__content">${ResumeStore.selfEvaluation}</div>`;
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
    // 间距设置
    document.getElementById('line-spacing').addEventListener('input', (e) => {
        ResumeStore.lineSpacing = parseInt(e.target.value) || 12;
        document.getElementById('line-spacing-value').textContent = ResumeStore.lineSpacing;
        applySpacingStyles();
        renderAll();
        window.saveData();
    });

    document.getElementById('module-spacing').addEventListener('input', (e) => {
        ResumeStore.moduleSpacing = parseInt(e.target.value) || 20;
        document.getElementById('module-spacing-value').textContent = ResumeStore.moduleSpacing;
        applySpacingStyles();
        renderAll();
        window.saveData();
    });

    document.getElementById('font-size').addEventListener('input', (e) => {
        ResumeStore.fontSize = parseInt(e.target.value) || 14;
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

    // 模板切换
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTemplate(btn.dataset.template);
        });
    });

    // 点击预览区域打开编辑
    document.querySelectorAll('.resume-mode, .resume-mode__info').forEach(el => {
        el.addEventListener('click', (e) => {
            const mKey = el.dataset.mkey || el.closest('[data-mkey]')?.dataset.mkey;
            if (mKey && editorPopup) {
                editorPopup.switchTab(mKey);
            }
        });
    });
}

// ============================================
// 模板与缩放
// ============================================
function switchTemplate(templateName) {
    currentTemplate = templateName;

    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.template === templateName);
    });

    const templateLink = document.getElementById('template-style');
    if (templateLink) {
        templateLink.href = `./css/templates/${templateName}.css`;
    }

    const previewEl = document.getElementById('resume-preview');
    if (previewEl) {
        previewEl.className = `a4-page ${templateName}`;
    }

    const settings = { template: templateName, zoom: currentZoom };
    localStorage.setItem('resume_settings', JSON.stringify(settings));

    setTimeout(() => {
        applySpacingStyles();
        updateResumeHeight();
    }, 100);
}

function adjustZoom(delta) {
    currentZoom = Math.max(0.5, Math.min(1.5, currentZoom + delta));
    applyZoom(currentZoom);
}

function resetZoom() {
    currentZoom = 1;
    applyZoom(currentZoom);
}

function applyZoom(zoom) {
    const previewEl = document.getElementById('resume-preview');
    if (previewEl) {
        previewEl.style.transform = `scale(${zoom})`;
    }

    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel) {
        zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    }
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
    } else {
        showMessage('PDF库加载失败，请刷新页面重试', 'error');
    }
}

function handleExportJSON() {
    const name = ResumeStore.baseInfo.name || '简历';
    saveData(); // 确保最新数据已保存
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

        // 合并数据
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

function toggleSection(headerEl) {
    const body = headerEl.nextElementSibling;
    headerEl.classList.toggle('collapsed');
    body.classList.toggle('hidden');
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

function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
