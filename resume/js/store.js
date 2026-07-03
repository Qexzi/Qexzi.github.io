/**
 * Pinia Store - 逆向自 lgdsunday.club
 * 完整复刻原站数据结构
 */

const ResumeStore = {
    // ============ 核心状态 ============
    resumeId: null,
    resumeName: '',
    templateName: 'simplicity',

    // ============ 基本信息 ============
    baseInfo: {
        name: '',
        birthday: '',
        gender: '',
        avatar: '',
        workHours: '',
        politicalStatus: '',
        phone: '',
        email: '',
        salary: '',
        nativePlace: '',
        jobIntention: '',
        cityIntention: '',
        entryTime: ''
    },

    // 额外基本信息字段
    addBaseInfo: [],

    // ============ 求职意向 ============
    jobInfo: {
        jobIntention: '',
        cityIntention: '',
        salary: '',
        entryTime: ''
    },

    // ============ 教育背景 ============
    education: [],

    // ============ 工作经验 ============
    work: [],

    // ============ 校园经历 ============
    campus: [],

    // ============ 技能特长 (HTML) ============
    skill: '',

    // ============ 荣誉证书 (HTML) ============
    certificate: '',

    // ============ 自我评价 (HTML) ============
    selfEvaluation: '',

    // ============ 项目经历 ============
    project: [],

    // ============ 实习经历 ============
    internship: [],

    // ============ 样式参数 ============
    fontSize: 14,
    moduleSpacing: 20,
    lineSpacing: 12,
    pageMargin: 32,
    themeColor: '#4e7282',

    // ============ 模块配置 ============
    itemData: [
        { mKey: 'base', index: 0, props: { name: '基本信息', mKey: 'base', isShow: true } },
        { mKey: 'job', index: 1, props: { name: '求职意向', mKey: 'job', isShow: true } },
        { mKey: 'education', index: 2, props: { name: '教育背景', mKey: 'education', isShow: true } },
        { mKey: 'work', index: 3, props: { name: '工作经验', mKey: 'work', isShow: true } },
        { mKey: 'campus', index: 4, props: { name: '校园经历', mKey: 'campus', isShow: false } },
        { mKey: 'skill', index: 5, props: { name: '技能特长', mKey: 'skill', isShow: true } },
        { mKey: 'certificate', index: 6, props: { name: '荣誉证书', mKey: 'certificate', isShow: false } },
        { mKey: 'selfEvaluation', index: 7, props: { name: '自我评价', mKey: 'selfEvaluation', isShow: false } },
        { mKey: 'project', index: 8, props: { name: '项目经历', mKey: 'project', isShow: true } },
        { mKey: 'internship', index: 9, props: { name: '实习经历', mKey: 'internship', isShow: false } }
    ],

    // ============ 其他配置 ============
    otherData: {
        isUploadAvatar: false,
        showAvatar: true,
        isAge: false
    },

    // ============ Getters ============
    getSortedItemData() {
        return [...this.itemData].sort((a, b) => a.index - b.index);
    },

    getAge() {
        if (!this.baseInfo.birthday) return '';
        const birth = new Date(this.baseInfo.birthday);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDiff = now.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    getAvatarPath() {
        if (this.otherData.isUploadAvatar) {
            return this.baseInfo.avatar;
        }
        return this.baseInfo.gender === '男'
            ? 'https://api.resume.lgdsunday.club/download/imgs/man.png'
            : 'https://api.resume.lgdsunday.club/download/imgs/woman.png';
    },

    getBaseInfo(excludeKeys = ['name', 'avatar']) {
        const result = {};
        for (const key in this.baseInfo) {
            if (!excludeKeys.includes(key) && this.baseInfo[key]) {
                result[key] = this.baseInfo[key];
            }
        }
        for (const item of this.addBaseInfo) {
            result[item.key] = item.value;
        }
        return result;
    },

    // ============ Actions ============
    toLeft(item) {
        if (!item || item.mKey === 'base' || item.mKey === 'job' || item.index <= 2) return;
        const targetIndex = item.index - 1;
        const target = this.itemData.find(i => i.index === targetIndex);
        if (target) {
            target.index += 1;
            item.index -= 1;
        }
    },

    toRight(item) {
        if (!item || item.mKey === 'base' || item.mKey === 'job' || item.index >= this.itemData.length - 1) return;
        const targetIndex = item.index + 1;
        const target = this.itemData.find(i => i.index === targetIndex);
        if (target) {
            target.index -= 1;
            item.index += 1;
        }
    },

    // 添加教育经历
    addEducation() {
        this.education.push({
            startDate: '',
            endDate: '',
            isNow: false,
            degree: '',
            title: '',
            desc: '',
            content: ''
        });
    },

    // 添加工作经验
    addWork() {
        this.work.push({
            startDate: '',
            endDate: '',
            isNow: false,
            title: '',
            desc: '',
            content: ''
        });
    },

    // 添加项目经历
    addProject() {
        this.project.push({
            startDate: '',
            endDate: '',
            isNow: false,
            title: '',
            desc: '',
            content: ''
        });
    },

    // 添加校园经历
    addCampus() {
        this.campus.push({
            startDate: '',
            endDate: '',
            isNow: false,
            title: '',
            desc: '',
            content: ''
        });
    },

    // 添加实习经历
    addInternship() {
        this.internship.push({
            startDate: '',
            endDate: '',
            isNow: false,
            title: '',
            desc: '',
            content: ''
        });
    },

    // 删除模块项
    removeItem(array, index) {
        array.splice(index, 1);
    },

    // 切换模块显示
    toggleModule(mKey) {
        const module = this.itemData.find(i => i.mKey === mKey);
        if (module) {
            module.props.isShow = !module.props.isShow;
        }
    },

    // 设置主题颜色
    setThemeColor(color) {
        this.themeColor = color;
    },

    // 设置字体大小
    setFontSize(size) {
        this.fontSize = Math.max(12, Math.min(16, size));
    },

    // 设置行间距
    setLineSpacing(spacing) {
        this.lineSpacing = Math.max(8, Math.min(20, spacing));
    },

    // 设置模块间距
    setModuleSpacing(spacing) {
        this.moduleSpacing = Math.max(12, Math.min(32, spacing));
    },

    // 设置页面边距
    setPageMargin(margin) {
        this.pageMargin = Math.max(20, Math.min(48, margin));
    }
};

// 导出
window.ResumeStore = ResumeStore;
