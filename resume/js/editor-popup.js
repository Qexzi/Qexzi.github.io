/**
 * 编辑弹窗组件 - 逆向自 lgdsunday.club
 * 原站使用底部弹出面板进行编辑
 */

class EditorPopup {
    constructor() {
        this.currentModule = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // 创建弹窗容器
        this.container = document.createElement('div');
        this.container.id = 'editor-popup';
        this.container.className = 'editor-popup';
        this.container.innerHTML = `
            <div class="popup-header">
                <div class="popup-tabs" id="popup-tabs"></div>
                <button class="popup-close" id="popup-close">✕</button>
            </div>
            <div class="popup-content" id="popup-content"></div>
        `;
        document.body.appendChild(this.container);

        // 绑定事件
        document.getElementById('popup-close').addEventListener('click', () => this.hide());

        // 初始化标签
        this.renderTabs();
    }

    // 渲染模块标签
    renderTabs() {
        const tabsContainer = document.getElementById('popup-tabs');
        const sortedData = ResumeStore.getSortedItemData();

        tabsContainer.innerHTML = sortedData.map(item => `
            <button class="popup-tab ${this.currentModule === item.mKey ? 'active' : ''}"
                    data-mkey="${item.mKey}"
                    onclick="editorPopup.switchTab('${item.mKey}')">
                ${item.props.name}
            </button>
        `).join('');
    }

    // 切换标签
    switchTab(mKey) {
        this.currentModule = mKey;
        this.renderTabs();
        this.renderContent();
        this.show();
    }

    // 渲染内容
    renderContent() {
        const content = document.getElementById('popup-content');

        switch (this.currentModule) {
            case 'base':
                content.innerHTML = this.renderBaseInfo();
                break;
            case 'job':
                content.innerHTML = this.renderJobInfo();
                break;
            case 'education':
                content.innerHTML = this.renderEducation();
                break;
            case 'work':
                content.innerHTML = this.renderWork();
                break;
            case 'project':
                content.innerHTML = this.renderProject();
                break;
            case 'campus':
                content.innerHTML = this.renderCampus();
                break;
            case 'internship':
                content.innerHTML = this.renderInternship();
                break;
            case 'skill':
                content.innerHTML = this.renderSkill();
                break;
            case 'certificate':
                content.innerHTML = this.renderCertificate();
                break;
            case 'selfEvaluation':
                content.innerHTML = this.renderSelfEvaluation();
                break;
            default:
                content.innerHTML = '<p class="popup-empty">请选择要编辑的模块</p>';
        }

        // 绑定输入事件
        this.bindInputEvents();
    }

    // 渲染基本信息表单
    renderBaseInfo() {
        const base = ResumeStore.baseInfo;
        return `
            <div class="popup-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>姓名</label>
                        <input type="text" value="${base.name || ''}" data-field="baseInfo.name" placeholder="请输入姓名">
                    </div>
                    <div class="form-group">
                        <label>性别</label>
                        <select data-field="baseInfo.gender">
                            <option value="">请选择</option>
                            <option value="男" ${base.gender === '男' ? 'selected' : ''}>男</option>
                            <option value="女" ${base.gender === '女' ? 'selected' : ''}>女</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>出生日期</label>
                        <input type="date" value="${base.birthday || ''}" data-field="baseInfo.birthday">
                    </div>
                    <div class="form-group">
                        <label>工作年限</label>
                        <select data-field="baseInfo.workHours">
                            <option value="">不填</option>
                            ${['应届生', '1年', '2年', '3年', '4年', '5年', '6年', '7年', '8年', '9年', '10年', '10年以上'].map(y =>
                                `<option value="${y}" ${base.workHours === y ? 'selected' : ''}>${y}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>手机号</label>
                        <input type="tel" value="${base.phone || ''}" data-field="baseInfo.phone" placeholder="请输入手机号">
                    </div>
                    <div class="form-group">
                        <label>邮箱</label>
                        <input type="email" value="${base.email || ''}" data-field="baseInfo.email" placeholder="请输入邮箱">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>籍贯</label>
                        <input type="text" value="${base.nativePlace || ''}" data-field="baseInfo.nativePlace" placeholder="如：北京">
                    </div>
                    <div class="form-group">
                        <label>政治面貌</label>
                        <select data-field="baseInfo.politicalStatus">
                            <option value="">不填</option>
                            <option value="群众" ${base.politicalStatus === '群众' ? 'selected' : ''}>群众</option>
                            <option value="团员" ${base.politicalStatus === '团员' ? 'selected' : ''}>团员</option>
                            <option value="党员" ${base.politicalStatus === '党员' ? 'selected' : ''}>党员</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>头像</label>
                    <div class="avatar-upload">
                        <div class="avatar-preview" id="popup-avatar-preview">
                            ${base.avatar ? `<img src="${base.avatar}" alt="头像">` : '<span>点击上传</span>'}
                        </div>
                        <input type="file" id="popup-avatar-input" accept="image/jpeg,image/png" style="display:none">
                        <button type="button" class="btn btn-sm" onclick="document.getElementById('popup-avatar-input').click()">选择图片</button>
                        <span class="hint">JPG/PNG，≤500KB</span>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染求职意向表单
    renderJobInfo() {
        const job = ResumeStore.jobInfo;
        return `
            <div class="popup-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>求职意向</label>
                        <input type="text" value="${job.jobIntention || ''}" data-field="jobInfo.jobIntention" placeholder="如：前端工程师">
                    </div>
                    <div class="form-group">
                        <label>期望城市</label>
                        <input type="text" value="${job.cityIntention || ''}" data-field="jobInfo.cityIntention" placeholder="如：北京">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>期望薪资</label>
                        <input type="text" value="${job.salary || ''}" data-field="jobInfo.salary" placeholder="如：20K-30K">
                    </div>
                    <div class="form-group">
                        <label>到岗时间</label>
                        <select data-field="jobInfo.entryTime">
                            <option value="">请选择</option>
                            <option value="随时" ${job.entryTime === '随时' ? 'selected' : ''}>随时</option>
                            <option value="一周内" ${job.entryTime === '一周内' ? 'selected' : ''}>一周内</option>
                            <option value="两周内" ${job.entryTime === '两周内' ? 'selected' : ''}>两周内</option>
                            <option value="一个月内" ${job.entryTime === '一个月内' ? 'selected' : ''}>一个月内</option>
                            <option value="面议" ${job.entryTime === '面议' ? 'selected' : ''}>面议</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染教育经历表单
    renderEducation() {
        const education = ResumeStore.education;
        return `
            <div class="popup-form">
                ${education.map((edu, index) => `
                    <div class="item-card">
                        <div class="card-header">
                            <span class="card-title">教育经历 ${index + 1}</span>
                            <button type="button" class="btn-delete" onclick="editorPopup.removeItem('education', ${index})">✕</button>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>学校</label>
                                <input type="text" value="${edu.title || ''}"
                                       onchange="editorPopup.updateItem('education', ${index}, 'title', this.value)"
                                       placeholder="请输入学校名称">
                            </div>
                            <div class="form-group">
                                <label>学历</label>
                                <select onchange="editorPopup.updateItem('education', ${index}, 'degree', this.value)">
                                    <option value="">请选择</option>
                                    ${['高中', '大专', '本科', '硕士', '博士'].map(d =>
                                        `<option value="${d}" ${edu.degree === d ? 'selected' : ''}>${d}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>专业</label>
                            <input type="text" value="${edu.desc || ''}"
                                   onchange="editorPopup.updateItem('education', ${index}, 'desc', this.value)"
                                   placeholder="请输入专业">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>开始时间</label>
                                <input type="month" value="${edu.startDate || ''}"
                                       onchange="editorPopup.updateItem('education', ${index}, 'startDate', this.value)">
                            </div>
                            <div class="form-group">
                                <label>结束时间</label>
                                <input type="month" value="${edu.endDate || ''}"
                                       ${edu.isNow ? 'disabled' : ''}
                                       onchange="editorPopup.updateItem('education', ${index}, 'endDate', this.value)">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${edu.isNow ? 'checked' : ''}
                                           onchange="editorPopup.updateItem('education', ${index}, 'isNow', this.checked)"> 至今
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>描述</label>
                            <textarea rows="3"
                                      onchange="editorPopup.updateItem('education', ${index}, 'content', this.value)"
                                      placeholder="描述在校表现、获奖情况等">${edu.content || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
                <button type="button" class="btn btn-add" onclick="editorPopup.addItem('education')">+ 添加教育经历</button>
            </div>
        `;
    }

    // 渲染工作经验表单
    renderWork() {
        const work = ResumeStore.work;
        return `
            <div class="popup-form">
                ${work.map((w, index) => `
                    <div class="item-card">
                        <div class="card-header">
                            <span class="card-title">工作经验 ${index + 1}</span>
                            <button type="button" class="btn-delete" onclick="editorPopup.removeItem('work', ${index})">✕</button>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>公司</label>
                                <input type="text" value="${w.title || ''}"
                                       onchange="editorPopup.updateItem('work', ${index}, 'title', this.value)"
                                       placeholder="请输入公司名称">
                            </div>
                            <div class="form-group">
                                <label>职位</label>
                                <input type="text" value="${w.desc || ''}"
                                       onchange="editorPopup.updateItem('work', ${index}, 'desc', this.value)"
                                       placeholder="请输入职位">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>开始时间</label>
                                <input type="month" value="${w.startDate || ''}"
                                       onchange="editorPopup.updateItem('work', ${index}, 'startDate', this.value)">
                            </div>
                            <div class="form-group">
                                <label>结束时间</label>
                                <input type="month" value="${w.endDate || ''}"
                                       ${w.isNow ? 'disabled' : ''}
                                       onchange="editorPopup.updateItem('work', ${index}, 'endDate', this.value)">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${w.isNow ? 'checked' : ''}
                                           onchange="editorPopup.updateItem('work', ${index}, 'isNow', this.checked)"> 至今
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>工作内容</label>
                            <textarea rows="3"
                                      onchange="editorPopup.updateItem('work', ${index}, 'content', this.value)"
                                      placeholder="描述工作内容和成就">${w.content || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
                <button type="button" class="btn btn-add" onclick="editorPopup.addItem('work')">+ 添加工作经验</button>
            </div>
        `;
    }

    // 渲染项目经历表单
    renderProject() {
        const project = ResumeStore.project;
        return `
            <div class="popup-form">
                ${project.map((p, index) => `
                    <div class="item-card">
                        <div class="card-header">
                            <span class="card-title">项目经历 ${index + 1}</span>
                            <button type="button" class="btn-delete" onclick="editorPopup.removeItem('project', ${index})">✕</button>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>项目名称</label>
                                <input type="text" value="${p.title || ''}"
                                       onchange="editorPopup.updateItem('project', ${index}, 'title', this.value)"
                                       placeholder="请输入项目名称">
                            </div>
                            <div class="form-group">
                                <label>担任角色</label>
                                <input type="text" value="${p.desc || ''}"
                                       onchange="editorPopup.updateItem('project', ${index}, 'desc', this.value)"
                                       placeholder="如：前端开发">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>开始时间</label>
                                <input type="month" value="${p.startDate || ''}"
                                       onchange="editorPopup.updateItem('project', ${index}, 'startDate', this.value)">
                            </div>
                            <div class="form-group">
                                <label>结束时间</label>
                                <input type="month" value="${p.endDate || ''}"
                                       ${p.isNow ? 'disabled' : ''}
                                       onchange="editorPopup.updateItem('project', ${index}, 'endDate', this.value)">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${p.isNow ? 'checked' : ''}
                                           onchange="editorPopup.updateItem('project', ${index}, 'isNow', this.checked)"> 至今
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>项目描述</label>
                            <textarea rows="3"
                                      onchange="editorPopup.updateItem('project', ${index}, 'content', this.value)"
                                      placeholder="描述项目内容、技术栈、成果等">${p.content || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
                <button type="button" class="btn btn-add" onclick="editorPopup.addItem('project')">+ 添加项目经历</button>
            </div>
        `;
    }

    // 渲染校园经历表单
    renderCampus() {
        const campus = ResumeStore.campus;
        return `
            <div class="popup-form">
                ${campus.map((c, index) => `
                    <div class="item-card">
                        <div class="card-header">
                            <span class="card-title">校园经历 ${index + 1}</span>
                            <button type="button" class="btn-delete" onclick="editorPopup.removeItem('campus', ${index})">✕</button>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>经历名称</label>
                                <input type="text" value="${c.title || ''}"
                                       onchange="editorPopup.updateItem('campus', ${index}, 'title', this.value)"
                                       placeholder="如：学生会主席">
                            </div>
                            <div class="form-group">
                                <label>组织</label>
                                <input type="text" value="${c.desc || ''}"
                                       onchange="editorPopup.updateItem('campus', ${index}, 'desc', this.value)"
                                       placeholder="如：校学生会">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>开始时间</label>
                                <input type="month" value="${c.startDate || ''}"
                                       onchange="editorPopup.updateItem('campus', ${index}, 'startDate', this.value)">
                            </div>
                            <div class="form-group">
                                <label>结束时间</label>
                                <input type="month" value="${c.endDate || ''}"
                                       ${c.isNow ? 'disabled' : ''}
                                       onchange="editorPopup.updateItem('campus', ${index}, 'endDate', this.value)">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${c.isNow ? 'checked' : ''}
                                           onchange="editorPopup.updateItem('campus', ${index}, 'isNow', this.checked)"> 至今
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>描述</label>
                            <textarea rows="3"
                                      onchange="editorPopup.updateItem('campus', ${index}, 'content', this.value)"
                                      placeholder="描述活动内容和成果">${c.content || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
                <button type="button" class="btn btn-add" onclick="editorPopup.addItem('campus')">+ 添加校园经历</button>
            </div>
        `;
    }

    // 渲染实习经历表单
    renderInternship() {
        const internship = ResumeStore.internship;
        return `
            <div class="popup-form">
                ${internship.map((i, index) => `
                    <div class="item-card">
                        <div class="card-header">
                            <span class="card-title">实习经历 ${index + 1}</span>
                            <button type="button" class="btn-delete" onclick="editorPopup.removeItem('internship', ${index})">✕</button>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>公司</label>
                                <input type="text" value="${i.title || ''}"
                                       onchange="editorPopup.updateItem('internship', ${index}, 'title', this.value)"
                                       placeholder="请输入公司名称">
                            </div>
                            <div class="form-group">
                                <label>职位</label>
                                <input type="text" value="${i.desc || ''}"
                                       onchange="editorPopup.updateItem('internship', ${index}, 'desc', this.value)"
                                       placeholder="请输入职位">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>开始时间</label>
                                <input type="month" value="${i.startDate || ''}"
                                       onchange="editorPopup.updateItem('internship', ${index}, 'startDate', this.value)">
                            </div>
                            <div class="form-group">
                                <label>结束时间</label>
                                <input type="month" value="${i.endDate || ''}"
                                       ${i.isNow ? 'disabled' : ''}
                                       onchange="editorPopup.updateItem('internship', ${index}, 'endDate', this.value)">
                                <label class="checkbox-label">
                                    <input type="checkbox" ${i.isNow ? 'checked' : ''}
                                           onchange="editorPopup.updateItem('internship', ${index}, 'isNow', this.checked)"> 至今
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>工作内容</label>
                            <textarea rows="3"
                                      onchange="editorPopup.updateItem('internship', ${index}, 'content', this.value)"
                                      placeholder="描述实习内容和成果">${i.content || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
                <button type="button" class="btn btn-add" onclick="editorPopup.addItem('internship')">+ 添加实习经历</button>
            </div>
        `;
    }

    // 渲染技能特长
    renderSkill() {
        return `
            <div class="popup-form">
                <div class="form-group">
                    <label>技能特长</label>
                    <textarea id="skill-editor" rows="8" placeholder="描述你的技能特长">${ResumeStore.skill || ''}</textarea>
                    <p class="hint">支持HTML格式，如：<strong>加粗</strong>、<em>斜体</em></p>
                </div>
            </div>
        `;
    }

    // 渲染荣誉证书
    renderCertificate() {
        return `
            <div class="popup-form">
                <div class="form-group">
                    <label>荣誉证书</label>
                    <textarea id="certificate-editor" rows="8" placeholder="描述你的荣誉证书">${ResumeStore.certificate || ''}</textarea>
                    <p class="hint">支持HTML格式</p>
                </div>
            </div>
        `;
    }

    // 渲染自我评价
    renderSelfEvaluation() {
        return `
            <div class="popup-form">
                <div class="form-group">
                    <label>自我评价</label>
                    <textarea id="selfEvaluation-editor" rows="8" placeholder="描述你的自我评价">${ResumeStore.selfEvaluation || ''}</textarea>
                    <p class="hint">支持HTML格式</p>
                </div>
            </div>
        `;
    }

    // 绑定输入事件
    bindInputEvents() {
        // 基本信息和求职意向的输入
        this.container.querySelectorAll('[data-field]').forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.dataset.field;
                const [section, key] = field.split('.');
                ResumeStore[section][key] = e.target.value;
                this.triggerUpdate();
            });

            input.addEventListener('change', (e) => {
                const field = e.target.dataset.field;
                const [section, key] = field.split('.');
                ResumeStore[section][key] = e.target.value;
                this.triggerUpdate();
            });
        });

        // 技能、证书、自我评价的输入
        ['skill', 'certificate', 'selfEvaluation'].forEach(key => {
            const editor = document.getElementById(`${key}-editor`);
            if (editor) {
                editor.addEventListener('input', (e) => {
                    ResumeStore[key] = e.target.value;
                    this.triggerUpdate();
                });
            }
        });

        // 头像上传
        const avatarInput = document.getElementById('popup-avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (file.size > 500 * 1024) {
                    alert('图片大小不能超过500KB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    ResumeStore.baseInfo.avatar = event.target.result;
                    ResumeStore.otherData.isUploadAvatar = true;
                    document.getElementById('popup-avatar-preview').innerHTML =
                        `<img src="${event.target.result}" alt="头像">`;
                    this.triggerUpdate();
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // 更新模块项
    updateItem(arrayName, index, field, value) {
        if (ResumeStore[arrayName] && ResumeStore[arrayName][index]) {
            ResumeStore[arrayName][index][field] = value;
            this.triggerUpdate();
        }
    }

    // 添加模块项
    addItem(arrayName) {
        switch (arrayName) {
            case 'education':
                ResumeStore.addEducation();
                break;
            case 'work':
                ResumeStore.addWork();
                break;
            case 'project':
                ResumeStore.addProject();
                break;
            case 'campus':
                ResumeStore.addCampus();
                break;
            case 'internship':
                ResumeStore.addInternship();
                break;
        }
        this.renderContent();
        this.triggerUpdate();
    }

    // 删除模块项
    removeItem(arrayName, index) {
        if (confirm('确定要删除吗？')) {
            ResumeStore.removeItem(ResumeStore[arrayName], index);
            this.renderContent();
            this.triggerUpdate();
        }
    }

    // 触发更新
    triggerUpdate() {
        // 保存数据
        if (window.saveData) {
            window.saveData();
        }

        // 重新渲染预览
        if (window.renderAll) {
            window.renderAll();
        }
    }

    // 显示弹窗
    show() {
        this.isVisible = true;
        this.container.classList.add('visible');
    }

    // 隐藏弹窗
    hide() {
        this.isVisible = false;
        this.container.classList.remove('visible');
    }
}

// 全局实例
let editorPopup;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    editorPopup = new EditorPopup();
});
