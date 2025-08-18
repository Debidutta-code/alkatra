import React from "react";
import { X, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; message: string }) => void;
  isSending?: boolean;
  sendSuccess?: boolean;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSending = false,
  sendSuccess = false
}) => {
  const { t } = useTranslation();

  const [form, setForm] = React.useState({
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-2"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("Help.contactForm.title", "Send Us a Message")}
          </h3>
          <button
            onClick={onClose}
            disabled={isSending}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label={t("Help.contactForm.close", "Close modal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success State */}
        {sendSuccess ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {t("Help.contactForm.sent", "Message Sent!")}
            </h4>
            <p className="text-sm text-gray-600">
              {t(
                "Help.contactForm.thankYou",
                "Thank you! Our team will get back to you soon."
              )}
            </p>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Help.contactForm.subject", "Subject")}
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                disabled={isSending}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("Help.contactForm.message", "Your Message")}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                disabled={isSending}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder={t(
                  "Help.contactForm.messagePlaceholder",
                  "Describe your issue..."
                )}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                {t("Help.contactForm.cancel", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-tripswift-blue text-white rounded-lg hover:bg-tripswift-blue disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isSending
                  ? t("Help.contactForm.sending", "Sending...")
                  : t("Help.contactForm.send", "Send Message")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactFormModal;