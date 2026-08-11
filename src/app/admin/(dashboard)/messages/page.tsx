import { Check, Mail, MailOpen, Phone, Trash2 } from "lucide-react";
import { getContactMessagesAdmin } from "@/lib/queries";
import { formatBanglaDate } from "@/lib/format";
import { deleteMessage, markMessageRead } from "@/app/admin/(dashboard)/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const messages = await getContactMessagesAdmin();
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">বার্তা সমূহ</h1>
        <p className="text-sm text-ink-500">
          যোগাযোগ ফর্ম থেকে আসা বার্তা
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {unreadCount} টি অপঠিত
            </span>
          )}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          এখনো কোনো বার্তা আসেনি।
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              data-row
              className={`rounded-xl border bg-white p-5 ${
                message.isRead ? "border-cream-300" : "border-brand-300 bg-brand-50/40"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {message.isRead ? (
                    <MailOpen className="h-4 w-4 text-ink-300" />
                  ) : (
                    <Mail className="h-4 w-4 text-brand-500" />
                  )}
                  <p className="text-sm font-bold text-ink-900">{message.name}</p>
                  {!message.isRead && (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      অপঠিত
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-500">{formatBanglaDate(message.createdAt)}</p>
              </div>

              {message.subject && (
                <p className="mt-2 text-sm font-semibold text-ink-700">{message.subject}</p>
              )}
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                {message.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-3">
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {message.phone}
                  </span>
                  {message.email && <span>{message.email}</span>}
                </p>
                <div className="flex items-center gap-2">
                  {!message.isRead && (
                    <form action={markMessageRead.bind(null, message.id)}>
                      <button
                        type="submit"
                        className="flex items-center gap-1 rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-cream-100"
                      >
                        <Check className="h-3.5 w-3.5" />
                        পঠিত হিসেবে চিহ্নিত
                      </button>
                    </form>
                  )}
                  <ConfirmButton
                    action={deleteMessage.bind(null, message.id)}
                    confirmText={`"${message.name}" এর বার্তাটি মুছে ফেলবেন?`}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    মুছুন
                  </ConfirmButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
