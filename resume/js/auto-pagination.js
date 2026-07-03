/**
 * 自动分页算法模块
 * 确保简历内容适应单页A4纸张
 */

class AutoPagination {
    /**
     * @param {HTMLElement} previewElement - 预览元素
     * @param {Object} options - 配置选项
     */
    constructor(previewElement, options = {}) {
        this.preview = previewElement;
        this.options = {
            a4Width: 794,   // A4宽度 (210mm @ 96dpi)
            a4Height: 1123, // A4高度 (297mm @ 96dpi)
            minFontSize: 10,
            maxFontSize: 14,
            minLineHeight: 1.3,
            maxLineHeight: 1.8,
            minSectionMargin: 12,
            maxSectionMargin: 24,
            minItemMargin: 8,
            maxItemMargin: 18,
            ...options
        };

        // 保存原始样式值
        this.originalStyles = {};
        this.isAdjusting = false;
    }

    /**
     * 检查内容是否超出单页
     * @returns {boolean}
     */
    isOverflow() {
        const contentHeight = this.preview.scrollHeight;
        return contentHeight > this.options.a4Height;
    }

    /**
     * 获取当前内容高度
     * @returns {number}
     */
    getContentHeight() {
        return this.preview.scrollHeight;
    }

    /**
     * 获取溢出量
     * @returns {number}
     */
    getOverflowAmount() {
        return this.preview.scrollHeight - this.options.a4Height;
    }

    /**
     * 自动调整内容以适应单页
     * @returns {Object} 调整结果
     */
    autoFit() {
        if (this.isAdjusting) {
            return { adjusted: false, reason: '正在调整中' };
        }

        this.isAdjusting = true;

        // 重置缩放
        this.preview.style.transform = 'scale(1)';

        // 如果内容未超出，无需调整
        if (!this.isOverflow()) {
            this.isAdjusting = false;
            this.updateStatus(true);
            return { adjusted: false, reason: '内容未超出' };
        }

        let adjusted = false;
        let reason = '';

        // 策略1: 调整字体大小
        if (this.adjustFontSize()) {
            adjusted = true;
            reason = '调整字体大小';
        }

        // 策略2: 调整行高
        if (this.isOverflow() && this.adjustLineHeight()) {
            adjusted = true;
            reason = '调整行高';
        }

        // 策略3: 调整段落间距
        if (this.isOverflow() && this.adjustSectionMargins()) {
            adjusted = true;
            reason = '调整段落间距';
        }

        // 策略4: 调整项目间距
        if (this.isOverflow() && this.adjustItemMargins()) {
            adjusted = true;
            reason = '调整项目间距';
        }

        // 策略5: 调整内边距
        if (this.isOverflow() && this.adjustPadding()) {
            adjusted = true;
            reason = '调整内边距';
        }

        // 策略6: 如果仍然超出，进行缩放
        if (this.isOverflow()) {
            this.scaleToFit();
            adjusted = true;
            reason = '缩放适应';
        }

        this.isAdjusting = false;
        this.updateStatus(!this.isOverflow());

        return {
            adjusted,
            reason,
            isFit: !this.isOverflow(),
            overflow: this.getOverflowAmount()
        };
    }

    /**
     * 调整字体大小
     * @returns {boolean} 是否调整成功
     */
    adjustFontSize() {
        const { minFontSize, maxFontSize } = this.options;
        let currentSize = maxFontSize;
        let adjusted = false;

        while (this.isOverflow() && currentSize > minFontSize) {
            currentSize -= 0.5;
            this.preview.style.fontSize = `${currentSize}px`;
            adjusted = true;
        }

        return adjusted;
    }

    /**
     * 调整行高
     * @returns {boolean} 是否调整成功
     */
    adjustLineHeight() {
        const { minLineHeight, maxLineHeight } = this.options;
        let currentHeight = maxLineHeight;
        let adjusted = false;

        while (this.isOverflow() && currentHeight > minLineHeight) {
            currentHeight -= 0.1;
            this.preview.style.lineHeight = currentHeight.toFixed(1);
            adjusted = true;
        }

        return adjusted;
    }

    /**
     * 调整段落间距
     * @returns {boolean} 是否调整成功
     */
    adjustSectionMargins() {
        const { minSectionMargin, maxSectionMargin } = this.options;
        const sections = this.preview.querySelectorAll('.resume-section');
        let adjusted = false;

        // 从最大间距开始递减
        let currentMargin = maxSectionMargin;

        while (this.isOverflow() && currentMargin > minSectionMargin) {
            currentMargin -= 4;
            sections.forEach(section => {
                section.style.marginBottom = `${currentMargin}px`;
            });
            adjusted = true;
        }

        return adjusted;
    }

    /**
     * 调整项目间距
     * @returns {boolean} 是否调整成功
     */
    adjustItemMargins() {
        const { minItemMargin, maxItemMargin } = this.options;
        const items = this.preview.querySelectorAll('.item');
        let adjusted = false;

        let currentMargin = maxItemMargin;

        while (this.isOverflow() && currentMargin > minItemMargin) {
            currentMargin -= 2;
            items.forEach(item => {
                item.style.marginBottom = `${currentMargin}px`;
            });
            adjusted = true;
        }

        return adjusted;
    }

    /**
     * 调整内边距
     * @returns {boolean} 是否调整成功
     */
    adjustPadding() {
        const header = this.preview.querySelector('.resume-header');
        const sections = this.preview.querySelectorAll('.resume-section');
        let adjusted = false;

        if (header) {
            const currentPadding = parseInt(getComputedStyle(header).paddingTop) +
                                   parseInt(getComputedStyle(header).paddingBottom);
            if (currentPadding > 40) {
                header.style.paddingTop = '28px';
                header.style.paddingBottom = '28px';
                adjusted = true;
            }
        }

        if (this.isOverflow()) {
            sections.forEach(section => {
                const currentPadding = parseInt(getComputedStyle(section).paddingTop) +
                                       parseInt(getComputedStyle(section).paddingBottom);
                if (currentPadding > 30) {
                    section.style.paddingTop = '14px';
                    section.style.paddingBottom = '14px';
                    adjusted = true;
                }
            });
        }

        return adjusted;
    }

    /**
     * 缩放适应
     */
    scaleToFit() {
        const contentHeight = this.preview.scrollHeight;
        const scale = this.options.a4Height / contentHeight;

        if (scale < 1 && scale > 0.7) {
            // 适度缩放
            this.preview.style.transform = `scale(${scale})`;
            this.preview.style.transformOrigin = 'top center';
            // 调整容器高度以匹配缩放后的内容
            this.preview.style.height = `${this.options.a4Height / scale}px`;
        } else if (scale <= 0.7) {
            // 内容过多，需要裁剪提示
            console.warn('内容过多，可能需要精简简历内容');
            this.preview.style.transform = 'scale(0.7)';
            this.preview.style.transformOrigin = 'top center';
        }
    }

    /**
     * 更新状态显示
     * @param {boolean} isFit - 是否适配
     */
    updateStatus(isFit) {
        const statusOk = document.getElementById('status-ok');
        const statusWarning = document.getElementById('status-warning');

        if (statusOk && statusWarning) {
            statusOk.style.display = isFit ? 'inline' : 'none';
            statusWarning.style.display = isFit ? 'none' : 'inline';
        }
    }

    /**
     * 重置所有调整
     */
    reset() {
        this.preview.style.transform = 'scale(1)';
        this.preview.style.fontSize = '';
        this.preview.style.lineHeight = '';
        this.preview.style.height = '';

        const sections = this.preview.querySelectorAll('.resume-section');
        sections.forEach(section => {
            section.style.marginBottom = '';
            section.style.paddingTop = '';
            section.style.paddingBottom = '';
        });

        const items = this.preview.querySelectorAll('.item');
        items.forEach(item => {
            item.style.marginBottom = '';
        });

        const header = this.preview.querySelector('.resume-header');
        if (header) {
            header.style.paddingTop = '';
            header.style.paddingBottom = '';
        }
    }

    /**
     * 监听内容变化
     * @param {Function} callback - 变化回调
     */
    observe(callback) {
        const observer = new MutationObserver(() => {
            // 防抖处理
            clearTimeout(this._observeTimer);
            this._observeTimer = setTimeout(() => {
                if (callback) {
                    callback();
                }
            }, 100);
        });

        observer.observe(this.preview, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        return observer;
    }

    /**
     * 获取适配建议
     * @returns {Object} 建议信息
     */
    getSuggestions() {
        const overflow = this.getOverflowAmount();

        if (overflow <= 0) {
            return {
                level: 'ok',
                message: '内容已适配单页',
                suggestions: []
            };
        }

        const suggestions = [];

        if (overflow > 200) {
            suggestions.push('内容较多，建议精简工作经历或项目描述');
        }

        if (overflow > 100) {
            suggestions.push('可以减少荣誉奖项或技能列表的描述');
        }

        if (overflow > 50) {
            suggestions.push('尝试缩短个人简介的长度');
        }

        return {
            level: overflow > 200 ? 'critical' : overflow > 100 ? 'warning' : 'info',
            message: `内容超出 ${Math.round(overflow)}px`,
            suggestions
        };
    }
}

// 导出模块
window.AutoPagination = AutoPagination;
