"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import siteConfig from "@/data/site-config.json";

const GAS_URL = "https://script.google.com/macros/s/AKfycbzk5VWXvgDJLoLW_eTYuXIxh_ziCrD9mbRsvtrK-Aulasx4eMt6QT9mzuq3HeQ8UGspxw/exec";
const LIFF_ID = siteConfig.api.liffId;

interface ReservationData {
  plan: string;
  date: string;
  time: string;
  price: string;
  email: string;
  prepayment: string;
}

export default function SignPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [activity, setActivity] = useState("");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("13:00");
  const [timeEnd, setTimeEnd] = useState("17:00");
  const [feeRent, setFeeRent] = useState("");
  const [feePrepayment, setFeePrepayment] = useState("");

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const [liffReady, setLiffReady] = useState(false);
  const [isInLiff, setIsInLiff] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);

  const today = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });

  // LIFF init
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const liff = (window as any).liff;
      if (liff) {
        liff.init({ liffId: LIFF_ID }).then(() => {
          setLiffReady(true);
          setIsInLiff(liff.isInClient());
        }).catch(() => setLiffReady(false));
      }
    };
    document.head.appendChild(script);
  }, []);

  // Canvas signature pad
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = wrapper.offsetWidth * ratio;
      canvas.height = wrapper.offsetHeight * ratio;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
    };

    resize();
    window.addEventListener("resize", resize);

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e) e.preventDefault();
      isDrawingRef.current = true;
      setHasSigned(true);
      ctx.beginPath();
      const pos = getPos(e);
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      if ("touches" in e) e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const end = () => {
      isDrawingRef.current = false;
      ctx.beginPath();
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", end);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", end);
    };
  }, []);

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Search reservation
  const searchReservation = async () => {
    if (!name.trim() || !phone.trim()) { alert("請先輸入姓名與電話"); return; }
    setSearching(true);
    try {
      const res = await fetch(GAS_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "SEARCH_RESERVATION", name: name.trim(), phone: phone.replace(/-/g, "") }),
      });
      const data = await res.json();
      if (data.status === "success" && data.found) {
        const d: ReservationData = data.data;
        if (d.plan) setActivity(d.plan);
        if (d.date) setDate(d.date);
        if (d.price) setFeeRent(String(d.price));
        if (d.email) setEmail(d.email);
        if (d.prepayment) setFeePrepayment(String(d.prepayment));
        if (d.time?.includes("-")) {
          const parts = d.time.split("-");
          setTimeStart(parts[0].trim());
          setTimeEnd(parts[1].trim());
        }
        alert("✅ 資料讀取成功！");
      } else {
        alert("❌ 找不到預約，請確認姓名與電話是否正確");
      }
    } catch {
      alert("系統錯誤，請稍後再試");
    } finally {
      setSearching(false);
    }
  };

  // Submit contract
  const submitContract = useCallback(async () => {
    if (!name.trim()) { alert("請輸入承租方姓名"); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("請輸入正確的 Email"); return; }
    if (!/^09\d{8}$/.test(phone)) { alert("請輸入正確的手機號碼"); return; }
    if (!activity.trim()) { alert("請輸入活動內容"); return; }
    if (!date) { alert("請選擇使用日期"); return; }
    if (!feeRent) { alert("請填寫場地租金"); return; }
    if (!hasSigned) { alert("請在下方簽名欄位簽名"); return; }

    setSubmitting(true);
    setSubmitStatus("合約生成中...");

    try {
      // Dynamic imports
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const captureArea = captureRef.current;
      if (!captureArea) throw new Error("capture area not found");

      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const scale = isMobile ? 2 : 3;
      const quality = isMobile ? 0.6 : 0.75;

      const canvasData = await html2canvas(captureArea, { scale, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const imgData = canvasData.toDataURL("image/jpeg", quality);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let pdfBase64: string;
      if (imgHeight > pdf.internal.pageSize.getHeight()) {
        const longPdf = new jsPDF("p", "mm", [pdfWidth, imgHeight + 10]);
        longPdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
        pdfBase64 = longPdf.output("datauristring");
      } else {
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
        pdfBase64 = pdf.output("datauristring");
      }

      setSubmitStatus("上傳存檔中...");

      const cleanDate = date.replace(/-/g, "");
      const fileName = `${cleanDate}_${name.trim()}_${phone.replace(/-/g, "")}_${activity}.pdf`;

      const response = await fetch(GAS_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "UPLOAD_IMG",
          image: pdfBase64,
          filename: fileName,
          user: name.trim(),
          phone: phone.replace(/-/g, ""),
          email,
          prepayment: feePrepayment,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setDownloadUrl(result.url);

        // Send Flex message if in LIFF
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liff = (window as any).liff;
        if (liffReady && isInLiff && liff) {
          try {
            await liff.sendMessages([{
              type: "flex",
              altText: "✅ 廢墟 BAR 場地合約已簽署完成",
              contents: {
                type: "bubble", size: "mega",
                header: {
                  type: "box", layout: "vertical", backgroundColor: "#1a1a1a", paddingAll: "xl",
                  contents: [
                    { type: "text", text: "✅ 簽約完成確認", color: "#c5a47e", weight: "bold", size: "lg", align: "center" },
                    { type: "text", text: "VENUE RENTAL CONTRACT", color: "#95A5A6", size: "xxs", align: "center", margin: "xs" },
                  ],
                },
                body: {
                  type: "box", layout: "vertical", paddingAll: "xl",
                  contents: [
                    { type: "text", text: `承租人：${name.trim()}`, weight: "bold", size: "md", color: "#1a1a1a" },
                    { type: "text", text: "您的場地租賃合約已完成簽署。", size: "sm", color: "#7F8C8D", margin: "sm" },
                    { type: "separator", margin: "xl" },
                    {
                      type: "box", layout: "vertical", margin: "xl", spacing: "sm",
                      contents: [
                        { type: "box", layout: "baseline", contents: [{ type: "text", text: "📍 地點", color: "#95A5A6", size: "sm", flex: 2 }, { type: "text", text: "廢墟 BAR", color: "#1a1a1a", size: "sm", flex: 5, weight: "bold" }] },
                        { type: "box", layout: "baseline", contents: [{ type: "text", text: "📅 日期", color: "#95A5A6", size: "sm", flex: 2 }, { type: "text", text: date, color: "#1a1a1a", size: "sm", flex: 5 }] },
                        { type: "box", layout: "baseline", contents: [{ type: "text", text: "⏰ 時段", color: "#95A5A6", size: "sm", flex: 2 }, { type: "text", text: `${timeStart} - ${timeEnd}`, color: "#1a1a1a", size: "sm", flex: 5 }] },
                      ],
                    },
                    { type: "separator", margin: "xl" },
                    { type: "button", style: "primary", height: "sm", color: "#c5a47e", margin: "md", action: { type: "uri", label: "下載合約 PDF", uri: result.url } },
                  ],
                },
              },
            }]);
          } catch (e) { console.error("Flex msg failed", e); }
          setTimeout(() => liff.closeWindow(), 2000);
        }

        setDone(true);
      } else {
        throw new Error(result.msg || "上傳失敗");
      }
    } catch (err) {
      console.error(err);
      alert("上傳失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
      setSubmitStatus("");
    }
  }, [name, phone, email, activity, date, feeRent, feePrepayment, hasSigned, timeStart, timeEnd, liffReady, isInLiff]);

  /* ─── Styles ─── */
  const cardBg = { backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", padding: "24px" };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: "0.95rem", border: "1px solid #ddd", borderRadius: "6px",
    backgroundColor: "#fafafa", fontFamily: "'Noto Sans TC', sans-serif", color: "#1a1a1a", outline: "none",
  };
  const readonlyInput: React.CSSProperties = { ...inputStyle, backgroundColor: "#f9f5eb", borderColor: "#e0d6c3", color: "#8a7a5b", fontWeight: "bold" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", color: "#7f8c8d", marginBottom: "4px", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#eee" }}>
        <div className="text-center p-10 rounded-xl max-w-md" style={{ backgroundColor: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#d4edda" }}>
            <i className="fas fa-check text-2xl" style={{ color: "#155724" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#1a1a1a", fontFamily: "'Noto Serif TC', serif" }}>簽署完成！</h2>
          <p className="text-sm mb-6" style={{ color: "#7f8c8d" }}>合約已成功上傳並存檔</p>
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noopener"
              className="inline-block font-bold py-3 px-8 rounded-full text-white transition"
              style={{ backgroundColor: "#c5a47e" }}
            >下載合約 PDF</a>
          )}
          <p className="text-xs mt-4" style={{ color: "#999" }}><i className="fas fa-shield-halved mr-1" />合約已加密存檔，連結 15 天內有效</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#eee", minHeight: "100vh" }}>
      {/* Header */}
      <div className="text-center py-10 mt-16" style={{ background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/images/cover-bg.jpg') center/cover", color: "#fff" }}>
        <h1 className="text-3xl font-medium tracking-widest mb-1" style={{ fontFamily: "'Noto Serif TC', serif" }}>場地租賃合約</h1>
        <p className="text-xs uppercase tracking-widest" style={{ color: "#c5a47e" }}>Venue Rental Agreement</p>
      </div>

      {/* Contract */}
      <div className="max-w-3xl mx-auto px-4 py-8" style={{ marginTop: "-20px", position: "relative", zIndex: 10 }}>
        <div ref={captureRef} style={{ ...cardBg, borderTop: "6px solid #c5a47e", padding: "40px", position: "relative" }}>
          {/* Watermark */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%) rotate(-45deg)", fontSize: "5rem", fontWeight: "bold", color: "rgba(0,0,0,0.03)", pointerEvents: "none", whiteSpace: "nowrap" }}>RUINS BAR</div>

          <div className="text-center pb-6 mb-6" style={{ borderBottom: "2px solid #eee" }}>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif TC', serif", color: "#1a1a1a" }}>場地租賃合約書</h2>
            <span className="text-xs" style={{ color: "#7f8c8d" }}>出租方：廢墟 BAR (甲方)</span>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 gap-5 mb-6">
            <div>
              <label style={labelStyle}>承租方 / 乙方 (Tenant Name)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="請輸入姓名" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>聯絡電話 (Phone)</label>
              <div className="flex gap-2">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" type="tel" style={inputStyle} />
                <button onClick={searchReservation} disabled={searching}
                  className="shrink-0 text-white font-medium px-4 rounded-md text-sm flex items-center gap-1 transition disabled:opacity-50"
                  style={{ backgroundColor: "#c5a47e" }}
                >
                  {searching ? <><i className="fas fa-spinner fa-spin" /> 查詢中</> : <><i className="fas fa-search" /> 帶入預約</>}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>電子信箱 (Email)</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>活動主要內容 (Activity)</label>
              <input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="活動類型" style={inputStyle} />
            </div>
          </div>

          {/* Legal text */}
          <div className="text-sm leading-relaxed" style={{ color: "#444", textAlign: "justify" }}>
            <p className="mb-3">立合約書人 出租方（以下簡稱甲方）：<strong>廢墟 BAR</strong> 與 承租方（以下簡稱乙方），雙方就場地租賃事宜，經協議訂立條款如下：</p>

            <h3 className="font-bold text-base mb-2 pl-2" style={{ borderLeft: "4px solid #c5a47e", color: "#1a1a1a" }}>第二條：租賃期間</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div><label style={labelStyle}>使用日期</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label style={labelStyle}>開始</label><input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>結束</label><input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} style={inputStyle} /></div>
              </div>
            </div>
            <p className="text-xs mb-4" style={{ color: "#666" }}>* 超時每 30 分鐘加收 NT$1,500。</p>

            <h3 className="font-bold text-base mb-2 pl-2" style={{ borderLeft: "4px solid #c5a47e", color: "#1a1a1a" }}>第三條：費用與付款方式</h3>
            <div className="space-y-4 mb-4">
              <div><label style={labelStyle}>場地租金總額</label><input type="number" value={feeRent} onChange={(e) => setFeeRent(e.target.value)} placeholder="總金額" style={inputStyle} /></div>
              <div><label style={labelStyle}>場地預約訂金 (固定)</label><input value="5000" readOnly style={readonlyInput} /></div>
              <div><label style={labelStyle}>專案預付款</label><input value={feePrepayment} readOnly placeholder="系統判斷" style={{ ...readonlyInput, backgroundColor: "#fff3cd" }} /></div>
              <div><label style={labelStyle}>場地保證金 (固定)</label><input value="3000" readOnly style={readonlyInput} /></div>
            </div>

            <h3 className="font-bold text-base mb-2 pl-2" style={{ borderLeft: "4px solid #c5a47e", color: "#1a1a1a" }}>第四條：取消與變更政策</h3>
            <p className="mb-1 font-bold" style={{ color: "#a94442" }}>※ 場地訂金一經支付概不退還，但可保留一年內延期折抵。</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>活動日 31 天前：退還專案預付款 100%</li>
              <li>15-30 天前：退 50%</li>
              <li>7-14 天前：退 30%</li>
              <li><strong style={{ color: "#a94442" }}>7 天內取消：全額不退</strong></li>
              <li>天災不可抗力：協議延期或全額退費</li>
            </ul>

            <h3 className="font-bold text-base mb-2 pl-2" style={{ borderLeft: "4px solid #c5a47e", color: "#1a1a1a" }}>第五條：場地使用規範</h3>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>禁用雙面膠、釘槍，損壞每處 NT$500 起</li>
              <li>禁止沙發上潑灑紅酒等，特殊清潔費 NT$1,000-3,000</li>
              <li><strong style={{ color: "#a94442" }}>全面禁菸</strong>（含電子煙）、禁止明火、拉炮</li>
              <li>22:00 後降低音量</li>
            </ul>

            <h3 className="font-bold text-base mb-2 pl-2" style={{ borderLeft: "4px solid #c5a47e", color: "#1a1a1a" }}>第六、七條</h3>
            <p>設備損壞照價賠償。訴訟管轄：臺灣高雄地方法院。</p>
          </div>

          {/* Signature */}
          <div className="mt-10">
            <div className="flex justify-between items-end mb-1">
              <span className="font-bold" style={{ fontFamily: "'Noto Serif TC', serif" }}>承租方(乙方) 簽名</span>
              <span className="text-xs" style={{ color: "#888" }}>本人已詳閱並同意上述條款</span>
            </div>
            <div ref={wrapperRef} className="relative rounded-lg overflow-hidden" style={{ border: "2px dashed #bdc3c7", backgroundColor: "#fafafa", height: "180px", cursor: "crosshair", touchAction: "none" }}>
              {!hasSigned && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl opacity-50" style={{ color: "#bdc3c7", fontFamily: "'Noto Serif TC', serif", pointerEvents: "none" }}>
                  Sign Here<br /><span className="text-xs">( 請在此處簽名 )</span>
                </span>
              )}
              <canvas ref={canvasRef} className="block w-full h-full" />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-mono font-bold" style={{ color: "#1a1a1a" }}>簽署日期: {today}</span>
              <button onClick={clearPad} className="text-sm flex items-center gap-1 transition hover:text-red-600" style={{ color: "#7f8c8d" }}>
                <i className="fas fa-eraser" /> 清除重簽
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="text-center py-10">
          <button
            onClick={submitContract}
            disabled={submitting}
            className="inline-flex items-center gap-2 font-bold text-lg py-4 px-12 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#1a1a1a", color: "#c5a47e", border: "1px solid #1a1a1a", boxShadow: "0 5px 15px rgba(44,62,80,0.2)" }}
          >
            {submitting ? <><i className="fas fa-spinner fa-spin" /> {submitStatus}</> : <>確認簽署並送出合約 <i className="fas fa-arrow-right" /></>}
          </button>
          <p className="text-xs mt-3" style={{ color: "#999" }}><i className="fas fa-shield-halved mr-1" />系統將自動生成合約 PDF 並加密存檔</p>
        </div>
      </div>
    </div>
  );
}
