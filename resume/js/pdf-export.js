/**
 * PDF导出模块
 * 使用 html2pdf.js 实现浏览器端PDF生成
 */

class PDFExporter {
    /**
     * @param {HTMLElement} element - 要导出的元素
     * @param {Object} options - 配置选项
     */
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            filename: '我的简历.pdf',
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            },
            ...options
        };

        this.isExporting = false;
    }

    /**
     * 导出PDF
     * @returns {Promise<boolean>} 是否成功
     */
    async exportPDF() {
        if (this.isExporting) {
            console.warn('正在导出中，请稍候...');
            return false;
        }

        if (!window.html2pdf) {
            console.error('html2pdf.js 未加载');
            alert('PDF导出库加载失败，请刷新页面重试');
            return false;
        }

        this.isExporting = true;
        this.showLoading(true);

        try {
            // 保存原始样式
            const originalTransform = this.element.style.transform;
            const originalHeight = this.element.style.height;

            // 临时移除缩放，确保完整导出
            this.element.style.transform = 'scale(1)';
            this.element.style.height = 'auto';

            // 配置选项
            const opt = {
                margin: 0,
                filename: this.options.filename,
                image: this.options.image,
                html2canvas: this.options.html2canvas,
                jsPDF: this.options.jsPDF
            };

            // 生成PDF
            await html2pdf().set(opt).from(this.element).save();

            // 恢复原始样式
            this.element.style.transform = originalTransform;
            this.element.style.height = originalHeight;

            this.showLoading(false);
            this.isExporting = false;
            return true;

        } catch (error) {
            console.error('PDF导出失败:', error);
            this.showLoading(false);
            this.isExporting = false;
            alert('PDF导出失败，请重试');
            return false;
        }
    }

    /**
     * 预览PDF（在新窗口打开）
     * @returns {Promise<boolean>} 是否成功
     */
    async previewPDF() {
        if (this.isExporting) {
            return false;
        }

        if (!window.html2pdf) {
            alert('PDF导出库加载失败，请刷新页面重试');
            return false;
        }

        this.isExporting = true;
        this.showLoading(true);

        try {
            // 保存原始样式
            const originalTransform = this.element.style.transform;
            const originalHeight = this.element.style.height;

            // 临时移除缩放
            this.element.style.transform = 'scale(1)';
            this.element.style.height = 'auto';

            // 配置选项
            const opt = {
                margin: 0,
                image: this.options.image,
                html2canvas: this.options.html2canvas,
                jsPDF: this.options.jsPDF
            };

            // 生成PDF blob
            const pdfBlob = await html2pdf().set(opt).from(this.element).outputPdf('blob');

            // 在新窗口打开
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            // 清理
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);

            // 恢复原始样式
            this.element.style.transform = originalTransform;
            this.element.style.height = originalHeight;

            this.showLoading(false);
            this.isExporting = false;
            return true;

        } catch (error) {
            console.error('PDF预览失败:', error);
            this.showLoading(false);
            this.isExporting = false;
            alert('PDF预览失败，请重试');
            return false;
        }
    }

    /**
     * 设置文件名
     * @param {string} filename - 文件名
     */
    setFilename(filename) {
        this.options.filename = filename;
    }

    /**
     * 显示/隐藏加载状态
     * @param {boolean} show - 是否显示
     */
    showLoading(show) {
        // 可以自定义加载提示
        const loadingEl = document.getElementById('pdf-loading');
        if (loadingEl) {
            loadingEl.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * 检查是否支持PDF导出
     * @returns {boolean}
     */
    static isSupported() {
        return !!window.html2pdf;
    }
}

// 导出模块
window.PDFExporter = PDFExporter;
