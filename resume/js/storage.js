/**
 * 简历数据存储模块
 * 使用 localStorage 进行数据持久化
 */

const ResumeStorage = {
    // 存储键名
    STORAGE_KEY: 'resume_editor_data',
    SETTINGS_KEY: 'resume_editor_settings',

    /**
     * 默认简历数据结构
     */
    getDefaultData() {
        return {
            basic: {
                name: '',
                gender: '',
                phone: '',
                email: '',
                title: '',
                location: '',
                summary: '',
                avatar: '' // Base64 编码的头像
            },
            education: [],
            experience: [],
            projects: [],
            skills: [],
            awards: []
        };
    },

    /**
     * 默认教育经历
     */
    getDefaultEducation() {
        return {
            id: this.generateId(),
            school: '',
            major: '',
            degree: '',
            startDate: '',
            endDate: '',
            description: ''
        };
    },

    /**
     * 默认工作经历
     */
    getDefaultExperience() {
        return {
            id: this.generateId(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            highlights: ['']
        };
    },

    /**
     * 默认项目经历
     */
    getDefaultProject() {
        return {
            id: this.generateId(),
            name: '',
            role: '',
            startDate: '',
            endDate: '',
            description: '',
            techStack: '',
            highlights: ['']
        };
    },

    /**
     * 默认荣誉奖项
     */
    getDefaultAward() {
        return {
            id: this.generateId(),
            name: '',
            date: ''
        };
    },

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * 保存简历数据
     * @param {Object} data - 简历数据
     */
    save(data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, serialized);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },

    /**
     * 加载简历数据
     * @returns {Object} 简历数据
     */
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // 合并默认数据，确保所有字段都存在
                return this.mergeWithDefault(parsed);
            }
            return this.getDefaultData();
        } catch (error) {
            console.error('加载数据失败:', error);
            return this.getDefaultData();
        }
    },

    /**
     * 合并数据与默认值
     * @param {Object} data - 已有数据
     * @returns {Object} 合并后的数据
     */
    mergeWithDefault(data) {
        const defaultData = this.getDefaultData();
        return {
            basic: { ...defaultData.basic, ...data.basic },
            education: Array.isArray(data.education) ? data.education : [],
            experience: Array.isArray(data.experience) ? data.experience : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            skills: Array.isArray(data.skills) ? data.skills : [],
            awards: Array.isArray(data.awards) ? data.awards : []
        };
    },

    /**
     * 清除所有数据
     */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    /**
     * 导出为JSON文件
     * @param {Object} data - 简历数据
     * @param {string} filename - 文件名
     */
    exportJSON(data, filename = 'resume-data.json') {
        const serialized = JSON.stringify(data, null, 2);
        const blob = new Blob([serialized], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    },

    /**
     * 从JSON文件导入
     * @param {File} file - 文件对象
     * @returns {Promise<Object>} 简历数据
     */
    importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const merged = this.mergeWithDefault(data);
                    this.save(merged);
                    resolve(merged);
                } catch (error) {
                    reject(new Error('无效的JSON文件'));
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            reader.readAsText(file);
        });
    },

    /**
     * 保存设置
     * @param {Object} settings - 设置项
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    },

    /**
     * 加载设置
     * @returns {Object} 设置项
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {
                template: 'simplicity',
                zoom: 1,
                autoSave: true
            };
        } catch (error) {
            return {
                template: 'simplicity',
                zoom: 1,
                autoSave: true
            };
        }
    },

    /**
     * 自动保存防抖定时器
     */
    _saveTimer: null,

    /**
     * 防抖自动保存
     * @param {Object} data - 简历数据
     * @param {number} delay - 延迟时间(毫秒)
     */
    debounceSave(data, delay = 500) {
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
        }

        this._saveTimer = setTimeout(() => {
            this.save(data);
        }, delay);
    }
};

// 导出模块
window.ResumeStorage = ResumeStorage;
