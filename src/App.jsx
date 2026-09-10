import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home, BookOpen, Zap, Target, XCircle, Bookmark, Settings, CheckCircle2,
  Circle, Flag, Clock, ChevronLeft, ChevronRight, TrendingUp, Award, Plus,
  Trash2, Pencil, Upload, Search, ArrowLeft, Sun, Moon, X, AlertTriangle,
  User, LogIn, LogOut, ShieldCheck, Download, RefreshCw, FileCheck, Sparkles, Printer
} from "lucide-react";
import { loginUser, registerUser, fetchProfile, logoutUser } from "./services/api";

/* ============================== THEME TOKENS ============================== */
const palette = {
  light: {
    bg: "#F5F6F3", surface: "#FFFFFF", ink: "#22304A", inkSoft: "#5B6B85",
    border: "#DEDCD3", accent: "#2F6F62", accentSoft: "#E4EEEB",
    correct: "#2F8F5B", incorrect: "#C1483C", incorrectSoft: "#F7E7E4",
    correctSoft: "#E4F3EA", gold: "#C7962B", navy: "#22304A",
  },
  dark: {
    bg: "#141B2A", surface: "#1B2438", ink: "#EDEFF4", inkSoft: "#9AA6BE",
    border: "#2C3654", accent: "#4FA995", accentSoft: "#1E3630",
    correct: "#4FA995", incorrect: "#E08A7D", incorrectSoft: "#3A231F",
    correctSoft: "#1B3327", gold: "#D9B25C", navy: "#0F1524",
  },
};

const serif = '"Source Serif Pro", "Iowan Old Style", Georgia, serif';
const sans = 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif';

/* ============================== SEED DATA ============================== */
const SUBJECTS = [
  { id: "htx369", name: "Bộ Đề Thi Trắc Nghiệm HTX 369 (80 Câu Sát Hạch)", accent: "#2F6F62" },
  { id: "toan", name: "Toán học", accent: "#2F6F62" },
  { id: "anh", name: "Tiếng Anh", accent: "#3B5BA5" },
  { id: "su", name: "Lịch sử Việt Nam", accent: "#C1483C" },
];

const TOPICS = [
  // HTX 369
  { id: "bai-1", subjectId: "htx369", name: "Bài 1 — Mục đích tối thượng" },
  { id: "bai-2", subjectId: "htx369", name: "Bài 2 — Tam giác mục tiêu" },
  { id: "bai-3", subjectId: "htx369", name: "Bài 3 — Tam giác kinh tế" },
  { id: "bai-4", subjectId: "htx369", name: "Bài 4 — Nhà kiến tạo hệ sinh thái" },
  { id: "bai-5", subjectId: "htx369", name: "Bài 5 — Không thưởng chỉ vì tuyển người" },
  { id: "bai-6", subjectId: "htx369", name: "Bài 6 — Bản chất Credit 369" },
  { id: "bai-7", subjectId: "htx369", name: "Bài 7 — Tam giác phúc lợi" },
  { id: "bai-8", subjectId: "htx369", name: "Bài 8 — Demo 5 phút & Xác nhận ĐẠT" },
  // Phổ thông
  { id: "dai-so", subjectId: "toan", name: "Đại số" },
  { id: "hinh-hoc", subjectId: "toan", name: "Hình học" },
  { id: "ngu-phap", subjectId: "anh", name: "Ngữ pháp" },
  { id: "tu-vung", subjectId: "anh", name: "Từ vựng" },
  { id: "phong-kien", subjectId: "su", name: "Thời kỳ phong kiến" },
  { id: "hien-dai", subjectId: "su", name: "Thời kỳ hiện đại" },
];

let _qid = 0;
const q = (topicId, content, options, correctIndex, explanation, difficulty = "medium", tags = []) => {
  _qid += 1;
  const topic = TOPICS.find((t) => t.id === topicId);
  return {
    id: "q" + _qid, topicId, subjectId: topic ? topic.subjectId : "htx369",
    content, options, correctIndex, explanation, difficulty, tags,
  };
};

const SEED_QUESTIONS = [
  // ================= BÀI 1 — MỤC ĐÍCH TỐI THƯỢNG =================
  q("bai-1", "Mục đích tối thượng của 369 là gì?",
    ["Tăng doanh số bán hàng", "Tăng số lượng thành viên", "Kiến tạo cuộc sống thịnh vượng, giàu Tự do, Hạnh phúc và Bình an cho các thành viên HTX", "Tăng số lượng Credit"],
    2, "Đây là đích đến của toàn bộ hệ sinh thái 369; App, doanh số và Credit chỉ là công cụ.", "easy"),
  q("bai-1", "Theo bài giảng, GMV, Credit và hoa hồng có ý nghĩa khi nào?",
    ["Khi tạo ra thật nhiều thành viên", "Khi chuyển hóa thành thịnh vượng cho thành viên", "Khi được quy đổi thành tiền mặt", "Khi tăng số lượng người giới thiệu"],
    1, "GMV, Credit và hoa hồng chỉ có ý nghĩa khi chuyển hóa thành sự thịnh vượng thực sự cho các thành viên.", "easy"),
  q("bai-1", "Nội dung nào KHÔNG thuộc 8 chiều thịnh vượng?",
    ["Thu nhập", "Sức khỏe", "Thời gian", "Tuyển dụng"],
    3, "Tuyển dụng không nằm trong 8 chiều thịnh vượng (Thu nhập, Sức khỏe, Thời gian, Năng lực, Mối quan hệ, Tinh thần, Cống hiến...).", "medium"),
  q("bai-1", "Có bao nhiêu chiều thịnh vượng được nêu trong bài 1?",
    ["5", "6", "7", "8"],
    3, "Có tổng cộng 8 chiều thịnh vượng được nêu rõ trong Bài 1.", "easy"),
  q("bai-1", "Từ động từ nào được yêu cầu sử dụng nhất quán khi nói về mục tiêu?",
    ["Kiếm", "Tuyển", "Kiến tạo", "Đầu tư"],
    2, "Động từ 'Kiến tạo' thể hiện tư duy xây dựng và tạo lập giá trị bền vững.", "easy"),
  q("bai-1", "Nếu xóa hết Credit và hoa hồng, điều gì còn lại theo tinh thần bài học?",
    ["Không còn giá trị nào", "Giá trị thật của sản phẩm, cơ hội kinh doanh, cộng đồng và cuộc sống thịnh vượng", "Chỉ còn doanh số", "Chỉ còn tuyển người"],
    1, "Giá trị cốt lõi còn lại là giá trị thật của sản phẩm, cơ hội kinh doanh và cuộc sống thịnh vượng của cộng đồng.", "medium"),
  q("bai-1", "Khi được hỏi “Tham gia 369 là bán hàng đa cấp hả?”, cách trả lời theo bài học là gì?",
    ["Có, nhưng là mô hình đặc biệt", "Không phải đa cấp; mua hàng có nguồn gốc rõ ràng và được cộng Credit khi mua", "Có nếu tuyển đủ người", "Không cần giải thích"],
    1, "369 không phải đa cấp; thành viên mua hàng rõ nguồn gốc và nhận Credit tích lũy.", "easy"),
  q("bai-1", "Theo bài học, có nên đặt hoa hồng lên trước mục đích tối thượng không?",
    ["Có", "Không", "Chỉ khi tuyển người mới", "Chỉ khi bán hàng"],
    1, "Không bao giờ đặt hoa hồng lên trước mục đích tối thượng của hệ sinh thái.", "easy"),
  q("bai-1", "Nếu một người hỏi “Tham gia có kiếm được nhiều tiền không?”, cần đưa nội dung nào lên trước?",
    ["Hoa hồng", "Credit", "Mục đích của dự án", "Số lượng thành viên"],
    2, "Cần truyền tải mục đích tối thượng và giá trị của dự án trước tiên.", "medium"),
  q("bai-1", "Bán hàng và Credit trong hệ sinh thái 369 được xác định là gì?",
    ["Mục đích cuối cùng", "Công cụ, không phải mục đích cuối cùng", "Khoản đầu tư", "Điều kiện bắt buộc để tuyển người"],
    1, "Bán hàng và Credit chỉ là phương tiện/công cụ để đạt tới mục đích thịnh vượng.", "easy"),

  // ================= BÀI 2 — TAM GIÁC MỤC TIÊU =================
  q("bai-2", "Tam giác Mục tiêu gồm ba đỉnh nào?",
    ["Thu nhập — Credit — Hoa hồng", "Sức khỏe đồng bào — Đoàn kết cộng đồng — Tự do dân tộc", "Sản phẩm — App — Doanh số", "Nhà sản xuất — NPP — NTD"],
    1, "Ba đỉnh của Tam giác Mục tiêu là: Sức khỏe đồng bào, Đoàn kết cộng đồng và Tự do dân tộc.", "easy"),
  q("bai-2", "Mục tiêu trung tâm của Tam giác Mục tiêu có đặc điểm gì?",
    ["Chỉ phục vụ doanh nghiệp", "Chỉ phục vụ người tiêu dùng", "Ba đỉnh cùng xoay quanh và cùng phục vụ", "Chỉ tập trung vào tự do kinh tế"],
    2, "Cả ba đỉnh cùng xoay quanh và tập trung phục vụ mục tiêu trung tâm.", "medium"),
  q("bai-2", "“Sức khỏe đồng bào” gắn với nội dung nào?",
    ["Tiếp cận hàng hóa phù hợp, minh bạch, chất lượng", "Tuyển thêm thành viên", "Tăng hoa hồng", "Tăng Credit"],
    0, "Sức khỏe đồng bào gắn liền với việc tiếp cận hàng hóa chất lượng, minh bạch và an toàn.", "easy"),
  q("bai-2", "“Đoàn kết cộng đồng” hướng tới xây dựng mạng lưới nào?",
    ["Chỉ người tiêu dùng", "Thành viên, HTX, doanh nghiệp, NPP, hộ kinh doanh", "Chỉ nhà sản xuất", "Chỉ NPP"],
    1, "Đoàn kết kết nối toàn bộ lực lượng: thành viên, HTX, doanh nghiệp, NPP và hộ kinh doanh.", "medium"),
  q("bai-2", "“Tự do dân tộc” trong bài học được mô tả như thế nào?",
    ["Tạo thêm cơ hội tự chủ về kinh tế cho cộng đồng", "Tăng số lượng Credit", "Tăng hoa hồng nhiều tầng", "Giảm giá mọi sản phẩm"],
    0, "Tự do dân tộc hướng tới tự chủ về kinh tế, phát huy nội lực cộng đồng.", "medium"),
  q("bai-2", "Một hoạt động chỉ giúp tăng trưởng nhanh nhưng không phục vụ Sức khỏe và Đoàn kết có nên làm không?",
    ["Có, vì tăng trưởng là quan trọng nhất", "Có, nếu có nhiều Credit", "Không", "Chỉ làm thử"],
    2, "Mọi hoạt động tăng trưởng không phục vụ các đỉnh mục tiêu đều không được triển khai.", "easy"),
  q("bai-2", "Phúc lợi trong bài 2 được xác định là gì?",
    ["Quyền lợi riêng của người tham gia", "Giá trị xã hội cộng đồng hướng tới", "Khoản hoa hồng", "Khoản đầu tư"],
    1, "Phúc lợi là giá trị chung cho toàn cộng đồng và xã hội.", "easy"),
  q("bai-2", "Có nên dùng phúc lợi làm lời mời gọi tham gia không?",
    ["Có", "Không", "Chỉ với người mới", "Chỉ khi có chương trình khuyến mãi"],
    1, "Không biến phúc lợi thành chiêu bài khẩu hiệu để lôi kéo tuyển người.", "easy"),
  q("bai-2", "Khi giới thiệu Tam giác Mục tiêu, điều quan trọng là gì?",
    ["Chỉ nói về lợi ích cá nhân", "Không biến “Phúc lợi” thành khẩu hiệu tuyển người", "Tập trung vào hoa hồng", "Tập trung vào Credit"],
    1, "Tránh thương mại hóa hay biến phúc lợi thành khẩu hiệu chiêu mộ.", "medium"),
  q("bai-2", "Ba đỉnh của Tam giác Mục tiêu có tách rời nhau không?",
    ["Có", "Không, chúng cùng phục vụ mục tiêu trung tâm", "Chỉ tách trong giai đoạn đầu", "Chỉ tách khi vận hành"],
    1, "Ba đỉnh luôn gắn kết chặt chẽ và nhất quán cùng phục vụ mục tiêu trung tâm.", "easy"),

  // ================= BÀI 3 — TAM GIÁC KINH TẾ =================
  q("bai-3", "Tam giác Kinh tế gồm những thành phần nào?",
    ["Kinh tế tuần hoàn — Kinh tế cộng đồng — Kinh tế chia sẻ", "Credit — Hoa hồng — GMV", "NTD — NPP — Nhà tổ chức", "Sản phẩm — App — Dữ liệu"],
    0, "Tam giác Kinh tế gồm: Kinh tế tuần hoàn, Kinh tế cộng đồng và Kinh tế chia sẻ.", "easy"),
  q("bai-3", "Trong Kinh tế tuần hoàn, chuỗi logic bắt đầu từ đâu?",
    ["Doanh nghiệp đầu tư", "NTD chi tiêu", "NPP tuyển người", "Credit được rút tiền"],
    1, "Chuỗi tuần hoàn khởi đầu từ nhu cầu tiêu dùng và chi tiêu thực tế của NTD.", "medium"),
  q("bai-3", "Chuỗi “Tiền → Hàng → Credit → Hàng → Tiền → Hàng” mô tả điều gì?",
    ["Kinh tế tuần hoàn", "Kinh tế chia sẻ", "Tuyển dụng", "Đầu tư tài chính"],
    0, "Đây là vòng quay giá trị khép kín trong mô hình Kinh tế tuần hoàn.", "easy"),
  q("bai-3", "Trong Kinh tế cộng đồng, nhiều thành viên cùng tạo thành điều gì?",
    ["Một khoản đầu tư", "Một thị trường", "Một tầng hoa hồng", "Một quỹ cá nhân"],
    1, "Số lượng thành viên đông đảo liên kết tạo nên một thị trường tiêu dùng vững mạnh.", "easy"),
  q("bai-3", "Khi nhiều NTD tạo sức mua, điều gì có thể xảy ra?",
    ["Thu hút nhà sản xuất", "Xóa bỏ nhu cầu tiêu dùng", "Không còn doanh thu", "Credit trở thành tiền mặt"],
    0, "Sức mua lớn thu hút các nhà sản xuất mang sản phẩm chất lượng, giá tốt đến cho cộng đồng.", "easy"),
  q("bai-3", "Kinh tế chia sẻ nhấn mạnh việc chia sẻ điều gì?",
    ["Chỉ tiền mặt", "Nền tảng công nghệ, dữ liệu, điểm bán, phân phối, cộng đồng và cơ hội kinh doanh", "Chỉ hoa hồng", "Chỉ Credit"],
    1, "Chia sẻ tài nguyên công nghệ, điểm bán, hạ tầng logistics và cơ hội kinh doanh cho tất cả thành viên.", "medium"),
  q("bai-3", "Theo tinh thần Kinh tế chia sẻ, người bán có nhất thiết phải tự ôm thật nhiều tồn kho không?",
    ["Có", "Không nhất thiết", "Bắt buộc", "Chỉ khi mới tham gia"],
    1, "Nhờ hạ tầng chia sẻ, người bán không cần ôm hàng hay áp lực tồn kho.", "easy"),
  q("bai-3", "Nếu một NTD ngừng mua hàng, yếu tố nào trong vòng tuần hoàn bị ảnh hưởng trực tiếp?",
    ["Vòng quay hàng hóa", "Phỏng vấn cuối khóa", "Demo 5 phút", "Tam giác Phúc lợi"],
    0, "Thiếu giao dịch mua hàng khiến tốc độ luân chuyển hàng hóa bị đình trệ.", "medium"),
  q("bai-3", "NTD, hộ kinh doanh, NPP và doanh nghiệp liên kết với nhau thông qua điều gì?",
    ["Chuỗi giá trị và thị trường", "Tuyển dụng nhiều tầng", "Khoản đầu tư", "Tài khoản Credit cá nhân"],
    0, "Tất cả các chủ thể gắn kết thông qua chuỗi giá trị và thị trường chia sẻ chung.", "easy"),
  q("bai-3", "Ý nghĩa của câu “nhiều thành viên cùng tạo thành một thị trường” là gì?",
    ["Mỗi người hoạt động riêng biệt", "Sức mua của nhiều NTD gộp lại tạo thị trường đủ lớn để thu hút nhà sản xuất", "Mỗi người phải tuyển ba người", "Mỗi người được nhận Credit bằng tiền mặt"],
    1, "Tập hợp sức mua tạo quy mô thị trường để nhận những ưu đãi và chất lượng tốt nhất.", "medium"),

  // ================= BÀI 4 — NHÀ TỔ CHỨC = NHÀ KIẾN TẠO HỆ SINH THÁI =================
  q("bai-4", "Nhà tổ chức trong mô hình 369 đảm nhiệm bao nhiêu nhiệm vụ nền tảng?",
    ["5", "6", "8", "10"],
    2, "Nhà tổ chức đảm nhiệm đúng 8 nhiệm vụ nền tảng.", "easy"),
  q("bai-4", "Nội dung nào sau đây là một nhiệm vụ của Nhà tổ chức?",
    ["Tuyển người để hưởng hoa hồng nhiều tầng", "Thiết kế hệ thống", "Cam kết lợi nhuận", "Bắt buộc thành viên tồn kho"],
    1, "Thiết kế và kiến tạo hệ thống vận hành là nhiệm vụ của Nhà tổ chức.", "medium"),
  q("bai-4", "Nội dung nào thuộc 8 nhiệm vụ nền tảng?",
    ["Quản lý Product Passport", "Tuyển người theo tầng", "Cam kết lợi nhuận", "Bán Credit lấy tiền mặt"],
    0, "Quản lý và minh bạch Product Passport cho từng sản phẩm là nhiệm vụ trọng tâm.", "medium"),
  q("bai-4", "Nhiệm vụ nào liên quan trực tiếp đến tính minh bạch?",
    ["Kiểm soát minh bạch", "Tuyển thật nhiều người", "Tăng hoa hồng", "Tăng tầng"],
    0, "Kiểm soát minh bạch xuất xứ, nguồn gốc hàng hóa và dòng tiền.", "easy"),
  q("bai-4", "369 Group được xác định là gì?",
    ["Một sàn thương mại đơn thuần", "Nhà kiến tạo hệ sinh thái", "Một tuyến trên", "Một quỹ đầu tư"],
    1, "369 Group đóng vai trò là Nhà kiến tạo hệ sinh thái.", "easy"),
  q("bai-4", "Nhà tổ chức khác “tuyến trên” ở điểm nào?",
    ["Nhà tổ chức tạo hạ tầng và giá trị chung", "Nhà tổ chức hưởng lợi từ mọi tầng dưới", "Nhà tổ chức chỉ tuyển người", "Nhà tổ chức không cần quản lý sản phẩm"],
    0, "Nhà tổ chức đầu tư hạ tầng, công nghệ và giá trị cho toàn bộ hệ thống.", "medium"),
  q("bai-4", "Nếu Nhà tổ chức chỉ tập trung tuyển người thay vì thực hiện 8 nhiệm vụ, điều gì có thể xảy ra?",
    ["Hệ sinh thái mất giá trị nền tảng", "Hệ sinh thái tự động phát triển tốt hơn", "Credit trở thành tiền mặt", "Không có ảnh hưởng"],
    0, "Bỏ qua 8 nhiệm vụ sẽ khiến hệ sinh thái suy thoái và biến chất.", "medium"),
  q("bai-4", "Khi được hỏi “Tôi tuyển được bao nhiêu người?”, hướng trả lời nên chuyển sang đâu?",
    ["Số tầng", "Giá trị và giao dịch thực tế", "Hoa hồng nhiều cấp", "Số Credit"],
    1, "Chuyển trọng tâm sang giá trị mang lại và lượng giao dịch hàng hóa thực tế.", "medium"),
  q("bai-4", "Điều gì quan trọng hơn số người được tuyển?",
    ["Bao nhiêu người thực sự mua hàng và thấy có lợi", "Bao nhiêu người vào nhóm", "Bao nhiêu tầng được tạo", "Bao nhiêu tài khoản được đăng ký"],
    0, "Số lượng người hài lòng khi mua sắm và nhận giá trị thực mới là thước đo cốt lõi.", "easy"),
  q("bai-4", "Vì sao nhấn mạnh khái niệm “Nhà kiến tạo hệ sinh thái”?",
    ["Để nhấn mạnh việc tuyển người", "Để phân biệt với cấu trúc tuyến trên hưởng lợi từ tuyến dưới", "Để biến Credit thành tiền", "Để tăng số tầng"],
    1, "Nhằm khẳng định vai trò tạo nền tảng phục vụ, hoàn toàn khác biệt với mô hình tuyến trên lôi kéo tuyến dưới.", "hard"),

  // ================= BÀI 5 — KHÔNG THƯỞNG CHỈ VÌ TUYỂN NGƯỜI =================
  q("bai-5", "Nguyên tắc quan trọng nhất của Bài 5 là gì?",
    ["Thưởng theo số người tuyển", "Mọi khoản thưởng phải gắn với giao dịch hàng hóa/dịch vụ thực tế", "Thưởng theo số tầng", "Thưởng theo số tài khoản"],
    1, "Chỉ thưởng khi phát sinh giao dịch hàng hóa/dịch vụ thực sự.", "easy"),
  q("bai-5", "Người mới có bắt buộc phải tuyển thêm người để nhận quyền lợi không?",
    ["Có", "Không", "Chỉ cần tuyển 1 người", "Chỉ cần tuyển 3 người"],
    1, "Hoàn toàn KHÔNG bắt buộc tuyển người để được hưởng quyền lợi mua sắm và tích lũy.", "easy"),
  q("bai-5", "1% được tính trên giao dịch của ai?",
    ["Tất cả người trong hệ thống", "NTD mà người kết nối trực tiếp giới thiệu", "Người ở tầng dưới của tầng dưới", "Tất cả người đăng ký"],
    1, "Chỉ tính 1% trên giao dịch thực tế của người dùng do mình trực tiếp giới thiệu.", "medium"),
  q("bai-5", "A được B giới thiệu. B được C giới thiệu. C có được hưởng lợi từ giao dịch của A không?",
    ["Có", "Không", "Có nếu A mua nhiều", "Có nếu A giới thiệu thêm người"],
    1, "C không hưởng từ A vì chỉ tính kết nối trực tiếp, không phân chia hoa hồng nhiều tầng.", "medium"),
  q("bai-5", "Khoản thưởng phải gắn với yếu tố nào?",
    ["Giao dịch hàng hóa/dịch vụ thực tế đã phát sinh", "Số người tuyển", "Số tầng", "Số lời hứa lợi nhuận"],
    0, "Gắn liền với giao dịch thực tế phát sinh từ hàng hóa/dịch vụ.", "easy"),
  q("bai-5", "Có bắt buộc tuyển đủ 3 người để nhận quyền lợi không?",
    ["Có", "Không", "Chỉ với thành viên mới", "Chỉ với NPP"],
    1, "Tuyệt đối không bắt buộc.", "easy"),
  q("bai-5", "Tuyển đủ 3 người được xem là gì theo bài học?",
    ["Điều kiện nhận thưởng bắt buộc", "KPI tăng trưởng cộng đồng", "Khoản đầu tư", "Điều kiện nhận Credit"],
    1, "Đây là chỉ số KPI khuyến khích phát triển cộng đồng.", "medium"),
  q("bai-5", "Vì sao cần tách KPI tăng trưởng khỏi cơ chế thưởng?",
    ["Để tăng số tầng", "Để tránh biến tăng trưởng cộng đồng thành cơ chế hoa hồng nhiều tầng", "Để giảm giao dịch", "Để giảm số thành viên"],
    1, "Giúp giữ cho mô hình minh bạch, tuân thủ pháp luật và không bị biến tướng thành đa cấp.", "hard"),
  q("bai-5", "Điều nào sau đây trái với nguyên tắc Bài 5?",
    ["Thưởng dựa trên giao dịch thực tế", "Không bắt buộc tuyển người", "Hưởng lợi từ tầng dưới của tầng dưới", "Chỉ tính người trực tiếp kết nối"],
    2, "Hưởng lợi gián tiếp từ nhiều tầng dưới là trái với nguyên tắc 369.", "medium"),
  q("bai-5", "Ranh giới được nhấn mạnh trong Bài 5 liên quan đến điều gì?",
    ["Phân biệt cộng đồng tiêu dùng hợp pháp với kinh doanh đa cấp", "Phân biệt người bán và người mua", "Phân biệt App và website", "Phân biệt Credit và tiền mặt"],
    0, "Định ranh giới rõ ràng giữa cộng đồng tiêu dùng minh bạch hợp pháp với mô hình kinh doanh đa cấp biến tướng.", "hard"),

  // ================= BÀI 6 — BẢN CHẤT CREDIT 369 =================
  q("bai-6", "Credit 369 gắn với hành vi nào?",
    ["Tuyển người", "Mua hàng", "Đầu tư tài chính", "Cho vay"],
    1, "Credit gắn liền với hành vi mua sắm hàng hóa thực tế.", "easy"),
  q("bai-6", "Welcome Credit được nêu trong bài là bao nhiêu?",
    ["17.000đ", "27.000đ", "37.000đ", "72.000đ"],
    1, "Mức Welcome Credit dành cho người mới là 27.000đ.", "easy"),
  q("bai-6", "27.000đ Welcome Credit được mô tả là gì?",
    ["Khoản đầu tư", "Mồi kích hoạt giao dịch đầu tiên cho NTD mới", "Tiền lãi", "Khoản vay"],
    1, "Là quà tặng mồi trải nghiệm kích hoạt giao dịch đầu tiên.", "medium"),
  q("bai-6", "Credit có mặc định rút được thành tiền mặt không?",
    ["Có", "Không", "Chỉ khi đạt KPI", "Chỉ khi giới thiệu người"],
    1, "Credit dùng để giảm giá/thanh toán mua sắm, không mặc định rút ra tiền mặt.", "easy"),
  q("bai-6", "Credit có được mua bán tự do không?",
    ["Có", "Không", "Chỉ với NPP", "Chỉ trong tháng đầu"],
    1, "Không mua bán trao đổi Credit tự do ngoài hệ thống.", "easy"),
  q("bai-6", "Credit có được tự do chuyển giữa các tài khoản không?",
    ["Có", "Không", "Có nếu đủ 3 người", "Có nếu Admin cho phép"],
    1, "Credit gắn với tiêu dùng tài khoản cá nhân, không chuyển tiền tự do giữa các user.", "easy"),
  q("bai-6", "Credit được gắn theo yếu tố nào?",
    ["Từng SKU/Campaign", "Số người tuyển", "Số tầng", "Thời gian tham gia"],
    0, "Credit được thiết lập linh hoạt theo từng mã sản phẩm SKU hoặc chiến dịch.", "medium"),
  q("bai-6", "Total Benefit cần hiển thị những gì?",
    ["Giá niêm yết → Giá ưu đãi → Credit nhận được → Tổng lợi ích quy ra tiền", "Số người → Số tầng → Hoa hồng", "Vốn → Lãi → Lợi nhuận", "Credit → Tiền mặt → Lãi suất"],
    0, "Minh bạch mọi giá trị: Giá gốc -> Giá giảm -> Credit được tặng -> Tổng lợi ích.", "medium"),
  q("bai-6", "Credit 369 có phải là khoản đầu tư sinh lời không?",
    ["Có", "Không", "Chỉ khi mua nhiều", "Chỉ khi giới thiệu người"],
    1, "Credit là điểm thưởng tiêu dùng, không phải sản phẩm tài chính hay đầu tư sinh lời.", "easy"),
  q("bai-6", "Có được cam kết lợi nhuận từ Credit không?",
    ["Có", "Tuyệt đối không", "Có nếu ghi rõ điều kiện", "Có với thành viên mới"],
    1, "Tuyệt đối không bao giờ hứa hẹn hay cam kết lợi nhuận từ Credit.", "easy"),

  // ================= BÀI 7 — TAM GIÁC PHÚC LỢI =================
  q("bai-7", "Tam giác Phúc lợi gồm ba nhóm nào?",
    ["NTD — NPP — Doanh nghiệp", "Người có công — Hộ nghèo — Người yếu thế", "Thành viên — Admin — Nhà tổ chức", "Người bán — Người mua — Nhà sản xuất"],
    1, "3 nhóm thụ hưởng: Người có công, Hộ nghèo và Người yếu thế trong xã hội.", "easy"),
  q("bai-7", "Trung tâm của Tam giác Phúc lợi là gì?",
    ["Credit", "Hoa hồng", "Phúc lợi", "Doanh số"],
    2, "Phúc lợi cộng đồng là tâm điểm của tam giác.", "easy"),
  q("bai-7", "Khi hệ sinh thái tạo ra giá trị, một phần nguồn lực có thể được dùng để làm gì?",
    ["Hỗ trợ cộng đồng theo cơ chế minh bạch và phù hợp pháp luật", "Chia đều cho người tuyển dụng", "Chuyển thành Credit cá nhân", "Trả thưởng theo tầng"],
    0, "Trích nguồn lực để hỗ trợ các đối tượng cộng đồng một cách công khai, đúng luật.", "medium"),
  q("bai-7", "Điều kiện triển khai phúc lợi cần có gì?",
    ["Quỹ/nguồn kinh phí rõ ràng", "Quy chế", "Đối tượng thụ hưởng cụ thể", "Tất cả các đáp án trên"],
    3, "Yêu cầu đầy đủ nguồn quỹ, quy chế minh bạch và danh sách đối tượng rõ ràng.", "easy"),
  q("bai-7", "Tiêu chí nào cần được công khai trong cơ chế phúc lợi?",
    ["Sử dụng nguồn lực", "Số tầng", "Số người tuyển", "Cam kết lợi nhuận"],
    0, "Công khai toàn bộ việc quản lý và phân bổ sử dụng nguồn lực.", "easy"),
  q("bai-7", "Phúc lợi có phải quyền lợi cá nhân khi tham gia không?",
    ["Có", "Không", "Chỉ với thành viên lâu năm", "Chỉ với NPP"],
    1, "Phúc lợi là chương trình xã hội chung, không phải hoa hồng quyền lợi cá nhân.", "easy"),
  q("bai-7", "Vì sao không biến phúc lợi thành khẩu hiệu tuyển người?",
    ["Vì phúc lợi là giá trị xã hội dự án hướng tới", "Vì phúc lợi không có giá trị", "Vì phúc lợi chỉ dành cho Admin", "Vì phúc lợi là Credit"],
    0, "Phúc lợi mang ý nghĩa phụng sự nhân văn, không được lợi dụng làm công cụ tiếp thị lôi kéo.", "medium"),
  q("bai-7", "Câu nào phù hợp với tinh thần bài học?",
    ["“Tham gia 369 để được hưởng phúc lợi.”", "“Khi cộng đồng phát triển, một phần giá trị có thể được dùng để hỗ trợ cộng đồng.”", "“Tuyển càng nhiều càng được phúc lợi.”", "“Phúc lợi là khoản thưởng cá nhân.”"],
    1, "Thể hiện đúng tinh thần sẻ chia tự nguyện khi hệ sinh thái lớn mạnh.", "medium"),
  q("bai-7", "Phúc lợi cần được triển khai theo nguyên tắc nào?",
    ["Minh bạch và phù hợp pháp luật", "Bí mật", "Theo số người tuyển", "Theo số tầng"],
    0, "Luôn tuân thủ tuyệt đối tính minh bạch và pháp luật hiện hành.", "easy"),
  q("bai-7", "Việc biến phúc lợi thành lời mời tuyển người có thể mâu thuẫn với nguyên tắc nào của Bài 5?",
    ["Không thưởng chỉ vì tuyển người", "Kinh tế tuần hoàn", "Product Passport", "Demo 5 phút"],
    0, "Vi phạm nguyên tắc 'Không thưởng chỉ vì tuyển người' của Bài 5.", "hard"),

  // ================= BÀI 8 — DEMO 5 PHÚT & XÁC NHẬN ĐẠT =================
  q("bai-8", "Demo 5 phút gồm bao nhiêu bước chính?",
    ["3", "4", "5", "8"],
    2, "Quy trình Demo 5 phút gồm đúng 5 bước chuẩn hóa.", "easy"),
  q("bai-8", "Trong 30 giây đầu tiên cần làm gì?",
    ["Nói về Credit", "Nói về công nghệ", "Mở đầu bằng lời mời cụ thể", "Nói về hoa hồng"],
    2, "Giao tiếp 30 giây đầu bằng lời mời cụ thể, tự nhiên.", "easy"),
  q("bai-8", "Ở bước 2 cần ưu tiên điều gì?",
    ["Cho THẤY trước khi giải thích", "Nói về hoa hồng", "Nói về tuyển người", "Nói về đầu tư"],
    0, "Trực quan sinh động: Trực tiếp cho người nghe THẤY thao tác trước.", "medium"),
  q("bai-8", "Nội dung nào xuất hiện trong bước “Cho THẤY”?",
    ["Quét QR, xem nguồn gốc và đánh giá", "Tuyển 3 người", "Tính hoa hồng nhiều tầng", "Cam kết lợi nhuận"],
    0, "Thao tác thực tế: Trải nghiệm quét mã QR, xem nguồn gốc xuất xứ và đánh giá.", "easy"),
  q("bai-8", "Bước 3 chứng minh lợi ích bằng gì?",
    ["Lời hứa", "Con số cụ thể — Total Benefit", "Số người tuyển", "Số tầng"],
    1, "Dùng con số thực tế Total Benefit minh bạch để chứng minh.", "medium"),
  q("bai-8", "Từ phút 3:00 đến 4:00, người demo cần làm gì?",
    ["NTD tự cài App và nhận ngay 27.000đ Welcome Credit", "NTD tuyển 3 người", "NTD đầu tư tiền", "NTD chuyển Credit cho người khác"],
    0, "Hướng dẫn NTD cài đặt App trực tiếp và nhận ngay 27.000đ Welcome Credit.", "medium"),
  q("bai-8", "Bước cuối cùng của demo là gì?",
    ["Chốt hành động — dùng thử ngay, hẹn quay lại", "Tuyển thêm người", "Cam kết lợi nhuận", "Bán Credit"],
    0, "Chốt hành động trải nghiệm ngay và lên lịch hẹn hỗ trợ.", "easy"),
  q("bai-8", "Demo có được mở đầu bằng công nghệ, chính sách hoặc Credit không?",
    ["Có", "Không", "Chỉ khi người nghe hỏi", "Chỉ với NPP"],
    1, "Không mở đầu bằng lý thuyết phức tạp, hãy đi thẳng từ nhu cầu thực tế.", "medium"),
  q("bai-8", "Điều kiện nào cần đạt trước khi bắt đầu vận động?",
    ["Có nhiều người theo dõi", "Đủ 8/8 nội dung và đạt các yêu cầu xác nhận", "Có 3 người được giới thiệu", "Có nhiều Credit"],
    1, "Yêu cầu phải nắm vững 8/8 nội dung và đạt sát hạch chuẩn.", "hard"),
  q("bai-8", "Điều kiện ĐẠT cuối khóa theo tài liệu gồm những gì?",
    ["Đủ 8/8 nội dung", "Demo 5 phút đạt", "Phỏng vấn xác nhận và không còn red flag chưa xử lý", "Tất cả các đáp án trên"],
    3, "Hội tụ đầy đủ cả 3 yếu tố: Lý thuyết 8/8, Thực hành Demo 5 phút và Phỏng vấn đánh giá.", "hard"),

  // ================= CÁC MÔN KHÁC (Phổ thông) =================
  q("dai-so", "Giải phương trình: 2x + 5 = 13", ["x = 3", "x = 4", "x = 5", "x = 6"], 1, "2x = 13 - 5 = 8, nên x = 4.", "easy"),
  q("hinh-hoc", "Tổng ba góc trong một tam giác bằng?", ["90°", "180°", "270°", "360°"], 1, "Định lý tổng ba góc trong tam giác luôn bằng 180°.", "easy"),
  q("ngu-phap", "Chọn đáp án đúng: She ___ to school every day.", ["go", "goes", "going", "gone"], 1, "Chủ ngữ 'she' số ít, động từ thường ở hiện tại đơn thêm 's': goes.", "easy"),
  q("tu-vung", "Từ đồng nghĩa với 'happy' là?", ["sad", "joyful", "angry", "tired"], 1, "'Joyful' mang nghĩa vui vẻ, đồng nghĩa với 'happy'.", "easy"),
  q("phong-kien", "Nhà nước phong kiến đầu tiên của Việt Nam là?", ["Nhà Lý", "Nhà Đinh", "Nhà Trần", "Nhà Lê"], 1, "Nhà Đinh (968) do Đinh Bộ Lĩnh lập ra, là triều đại phong kiến tập quyền đầu tiên.", "medium"),
  q("hien-dai", "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập vào ngày nào?", ["19/8/1945", "2/9/1945", "30/4/1975", "7/5/1954"], 1, "Ngày 2/9/1945 tại Quảng trường Ba Đình, Hà Nội.", "easy"),
];

/* ============================== HELPERS ============================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const fmtTime = (sec) => {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const diffLabel = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
const diffColor = (t, d) => (d === "easy" ? t.correct : d === "hard" ? t.incorrect : t.gold);

async function storageGet(key, fallback) {
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
      const res = await window.storage.get(key, false);
      if (res && res.value) return JSON.parse(res.value);
    }
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local);
    return fallback;
  } catch (e) {
    return fallback;
  }
}

async function storageSet(key, value) {
  try {
    if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
      await window.storage.set(key, JSON.stringify(value), false);
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* best-effort */
  }
}

const DEFAULT_PROGRESS = { totalAnswered: 0, totalCorrect: 0, streak: 0, lastStudyDate: null, history: [] };

/* ============================== ROOT APP ============================== */
export default function App() {
  const [dark, setDark] = useState(false);
  const t = dark ? palette.dark : palette.light;

  const [ready, setReady] = useState(false);
  const [view, setView] = useState("dashboard");
  const [selSubject, setSelSubject] = useState(null);
  const [selTopic, setSelTopic] = useState(null);
  const [quizSetup, setQuizSetup] = useState(null); // {mode, questions, timeLimit}
  const [lastResult, setLastResult] = useState(null);
  const [showCertificate, setShowCertificate] = useState(null);

  const [bank, setBank] = useState(SEED_QUESTIONS);
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [wrongIds, setWrongIds] = useState([]);
  const [bookmarkIds, setBookmarkIds] = useState([]);

  // User Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    (async () => {
      const [b, p, w, bm, currentUser] = await Promise.all([
        storageGet("question-bank", SEED_QUESTIONS),
        storageGet("progress", DEFAULT_PROGRESS),
        storageGet("wrong-ids", []),
        storageGet("bookmark-ids", []),
        fetchProfile(),
      ]);
      setBank(b); setProgress(p); setWrongIds(w); setBookmarkIds(bm);
      if (currentUser) setUser(currentUser);
      setReady(true);
    })();
  }, []);

  const persistProgress = (p) => { setProgress(p); storageSet("progress", p); };
  const persistWrong = (w) => { setWrongIds(w); storageSet("wrong-ids", w); };
  const persistBookmarks = (b) => { setBookmarkIds(b); storageSet("bookmark-ids", b); };
  const persistBank = (b) => { setBank(b); storageSet("question-bank", b); };

  const toggleBookmark = (qid) => {
    const next = bookmarkIds.includes(qid) ? bookmarkIds.filter((x) => x !== qid) : [...bookmarkIds, qid];
    persistBookmarks(next);
  };

  const finishQuiz = (summary) => {
    const wasCorrectIds = summary.perQuestion.filter((x) => x.correct).map((x) => x.id);
    const wasWrongIds = summary.perQuestion.filter((x) => x.correct === false).map((x) => x.id);
    const nextWrong = Array.from(new Set([...wrongIds.filter((id) => !wasCorrectIds.includes(id)), ...wasWrongIds]));
    persistWrong(nextWrong);

    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today = todayStr();
    let streak = progress.streak;
    if (progress.lastStudyDate === today) streak = progress.streak;
    else if (progress.lastStudyDate === y) streak = progress.streak + 1;
    else streak = 1;

    const nextProgress = {
      totalAnswered: progress.totalAnswered + summary.total,
      totalCorrect: progress.totalCorrect + summary.correctCount,
      streak, lastStudyDate: today,
      history: [{ id: uid(), date: today, mode: summary.mode, subjectId: summary.subjectId, score: summary.correctCount, total: summary.total }, ...progress.history].slice(0, 50),
    };
    persistProgress(nextProgress);
    setLastResult(summary);
    setView("results");
  };

  const startQuiz = (mode, questions, opts = {}) => {
    setQuizSetup({ mode, questions, timeLimit: opts.timeLimit || null, subjectId: opts.subjectId || null });
    setView("quiz");
  };

  const startFullHTX369Exam = () => {
    const htxQs = bank.filter((q) => q.subjectId === "htx369");
    startQuiz("exam", htxQs, { subjectId: "htx369", timeLimit: 60 * 60 });
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (!ready) {
    return (
      <div style={{ background: t.bg, color: t.ink, fontFamily: sans }} className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin" size={28} color={t.accent} />
          <div className="text-sm font-medium" style={{ color: t.inkSoft }}>Đang tải Bộ đề thi trắc nghiệm HTX 369…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: sans }} className="w-full min-h-screen flex flex-col md:flex-row">
      <SideNav
        t={t} dark={dark} setDark={setDark} view={view}
        setView={(v) => { setView(v); setSelSubject(null); setSelTopic(null); }}
        user={user} onOpenAuth={() => setShowAuthModal(true)} onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8 pb-24 md:pb-8">
        {/* User Header bar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b md:hidden" style={{ borderColor: t.border }}>
          <div style={{ fontFamily: serif, color: t.ink }} className="text-xl font-bold">
            Ôn<span style={{ color: t.accent }}>Luyện 369</span>
          </div>
          {user ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: t.inkSoft }}>
              <User size={14} color={t.accent} />
              <span className="font-semibold" style={{ color: t.ink }}>{user.name || user.email}</span>
              <button onClick={handleLogout} className="p-1 rounded hover:bg-black/5"><LogOut size={14} /></button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-white font-medium" style={{ background: t.accent }}>
              <LogIn size={13} /> Đăng nhập
            </button>
          )}
        </div>

        {view === "dashboard" && (
          <Dashboard t={t} progress={progress} bank={bank} wrongCount={wrongIds.length} bookmarkCount={bookmarkIds.length}
            onQuickStart={() => {
              const htx = bank.filter((q) => q.subjectId === "htx369");
              startQuiz("quick", shuffle(htx).slice(0, 20), { subjectId: "htx369" });
            }}
            onPractice={() => {
              const htxSub = SUBJECTS.find((s) => s.id === "htx369");
              setSelSubject(htxSub);
              setView("topics");
            }}
            onExam={startFullHTX369Exam}
            onWrong={() => setView("wrong")} user={user} onOpenAuth={() => setShowAuthModal(true)} />
        )}
        {(view === "subjects" || view === "subjects-quick" || view === "subjects-exam") && (
          <SubjectPicker t={t} subjects={SUBJECTS} bank={bank}
            onBack={() => setView("dashboard")}
            onPick={(s) => {
              setSelSubject(s);
              if (view === "subjects-quick") setView("quick-setup");
              else if (view === "subjects-exam") setView("exam-setup");
              else setView("topics");
            }} />
        )}
        {view === "topics" && selSubject && (
          <TopicPicker t={t} subject={selSubject} topics={TOPICS.filter((tp) => tp.subjectId === selSubject.id)} bank={bank}
            onBack={() => setView("subjects")}
            onPick={(tp) => {
              setSelTopic(tp);
              const qs = shuffle(bank.filter((q) => q.topicId === tp.id));
              startQuiz("practice", qs, { subjectId: selSubject.id });
            }} />
        )}
        {view === "quick-setup" && selSubject && (
          <QuickSetup t={t} subject={selSubject} onBack={() => setView("subjects-quick")}
            onStart={(count) => {
              const pool = shuffle(bank.filter((q) => q.subjectId === selSubject.id));
              startQuiz("quick", pool.slice(0, Math.min(count, pool.length)), { subjectId: selSubject.id });
            }} />
        )}
        {view === "exam-setup" && selSubject && (
          <ExamSetup t={t} subject={selSubject} onBack={() => setView("subjects-exam")}
            onStart={(count, minutes) => {
              const pool = shuffle(bank.filter((q) => q.subjectId === selSubject.id));
              startQuiz("exam", pool.slice(0, Math.min(count, pool.length)), { subjectId: selSubject.id, timeLimit: minutes * 60 });
            }} />
        )}
        {view === "quiz" && quizSetup && (
          <QuizRunner t={t} setup={quizSetup} bookmarkIds={bookmarkIds} onToggleBookmark={toggleBookmark}
            onExit={() => setView("dashboard")} onFinish={finishQuiz} />
        )}
        {view === "results" && lastResult && (
          <ResultsView t={t} result={lastResult} user={user} onHome={() => setView("dashboard")}
            onReviewWrong={() => setView("wrong")}
            onOpenCert={() => setShowCertificate(lastResult)}
            onRetakeWrong={() => {
              const qs = lastResult.perQuestion.filter((x) => x.correct === false).map((x) => x.question);
              if (qs.length) startQuiz("practice", shuffle(qs), { subjectId: lastResult.subjectId });
            }} />
        )}
        {view === "wrong" && (
          <WrongQuestions t={t} bank={bank} wrongIds={wrongIds} subjects={SUBJECTS} topics={TOPICS}
            onRemove={(id) => persistWrong(wrongIds.filter((x) => x !== id))}
            onPracticeAll={(qs) => startQuiz("practice", shuffle(qs), {})} />
        )}
        {view === "bookmarks" && (
          <BookmarksView t={t} bank={bank} bookmarkIds={bookmarkIds} subjects={SUBJECTS} topics={TOPICS}
            onRemove={toggleBookmark} onPracticeAll={(qs) => startQuiz("practice", shuffle(qs), {})} />
        )}
        {view === "admin" && (
          <AdminPanel t={t} bank={bank} subjects={SUBJECTS} topics={TOPICS} onChange={persistBank} progress={progress} />
        )}
      </main>

      <MobileTabs t={t} view={view} setView={(v) => { setView(v); setSelSubject(null); setSelTopic(null); }} />

      {showAuthModal && (
        <AuthModal t={t} onClose={() => setShowAuthModal(false)} onAuthSuccess={(u) => { setUser(u); setShowAuthModal(false); }} />
      )}

      {showCertificate && (
        <CertificateModal t={t} result={showCertificate} user={user} onClose={() => setShowCertificate(null)} />
      )}
    </div>
  );
}

/* ============================== NAV ============================== */
const NAV_ITEMS = [
  { id: "dashboard", label: "Trang chủ", icon: Home },
  { id: "subjects", label: "Ôn Luyện 369", icon: BookOpen },
  { id: "subjects-quick", label: "Luyện nhanh", icon: Zap },
  { id: "subjects-exam", label: "Thi sát hạch", icon: Target },
  { id: "wrong", label: "Câu hỏi sai", icon: XCircle },
  { id: "bookmarks", label: "Đã lưu", icon: Bookmark },
  { id: "admin", label: "Quản trị đề", icon: Settings },
];

function SideNav({ t, dark, setDark, view, setView, user, onOpenAuth, onLogout }) {
  const activeGroup = (id) => (id === "subjects" && view === "topics") || view === id;
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r min-h-screen" style={{ borderColor: t.border, background: t.surface }}>
      <div className="px-6 py-6 border-b" style={{ borderColor: t.border }}>
        <div style={{ fontFamily: serif, color: t.ink }} className="text-2xl font-bold">Ôn<span style={{ color: t.accent }}>Luyện 369</span></div>
        <div className="text-xs mt-1" style={{ color: t.inkSoft }}>Hệ thống Thi Trắc Nghiệm HTX 369</div>
      </div>

      {/* User Section */}
      <div className="px-4 py-4 border-b" style={{ borderColor: t.border }}>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: t.accent }}>
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold truncate" style={{ color: t.ink }}>{user.name || "Học viên HTX 369"}</div>
                <div className="text-[10px] truncate" style={{ color: t.inkSoft }}>{user.email}</div>
              </div>
            </div>
            <button onClick={onLogout} title="Đăng xuất" className="p-1.5 rounded-lg hover:bg-black/5 text-xs" style={{ color: t.inkSoft }}>
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-white shadow-sm" style={{ background: t.accent }}>
            <LogIn size={15} /> Đăng nhập / Đăng ký
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeGroup(item.id);
          return (
            <button key={item.id} onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{ background: active ? t.accentSoft : "transparent", color: active ? t.accent : t.inkSoft, fontWeight: active ? 600 : 500 }}>
              <Icon size={17} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t" style={{ borderColor: t.border }}>
        <button onClick={() => setDark(!dark)} className="flex items-center gap-2 text-xs font-medium" style={{ color: t.inkSoft }}>
          {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? "Giao diện sáng" : "Giao diện tối"}
        </button>
      </div>
    </aside>
  );
}

function MobileTabs({ t, view, setView }) {
  const items = NAV_ITEMS.filter((i) => ["dashboard", "subjects", "subjects-quick", "wrong", "bookmarks"].includes(i.id));
  const activeGroup = (id) => (id === "subjects" && view === "topics") || view === id;
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around py-2 border-t z-40" style={{ background: t.surface, borderColor: t.border }}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeGroup(item.id);
        return (
          <button key={item.id} onClick={() => setView(item.id)} className="flex flex-col items-center gap-0.5 px-2 py-1">
            <Icon size={19} strokeWidth={2} color={active ? t.accent : t.inkSoft} />
            <span style={{ color: active ? t.accent : t.inkSoft, fontWeight: active ? 600 : 500 }} className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ============================== DASHBOARD ============================== */
function Dashboard({ t, progress, bank, wrongCount, bookmarkCount, onQuickStart, onPractice, onExam, onWrong, user, onOpenAuth }) {
  const acc = progress.totalAnswered ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0;
  const htxCount = bank.filter((q) => q.subjectId === "htx369").length;

  return (
    <div className="max-w-4xl">
      {/* Hero Banner HTX 369 */}
      <div className="rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-md relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E4D42 0%, #2F6F62 50%, #1B3832 100%)" }}>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm mb-3">
            <Sparkles size={14} className="text-yellow-300" /> BỘ ĐỀ THI SÁT HẠCH CHUẨN 2026
          </span>
          <h1 style={{ fontFamily: serif }} className="text-2xl sm:text-3xl font-bold mb-2">
            Chương Trình Đào Tạo HTX 369
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mb-6 leading-relaxed">
            Hệ thống bộ đề thi trắc nghiệm gồm <strong>80 câu hỏi sát hạch</strong> bao gồm trọn bộ 8 Bài học: Mục đích tối thượng, Tam giác mục tiêu, Tam giác kinh tế, Nhà kiến tạo hệ sinh thái, Cơ chế thưởng & Credit 369.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onExam} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#2F6F62] font-bold text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-95">
              <Target size={18} /> Thi Sát Hạch Toàn Bộ (80 Câu)
            </button>
            <button onClick={onPractice} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-900/60 text-white font-semibold text-sm border border-white/30 backdrop-blur-sm transition-all">
              <BookOpen size={18} /> Ôn Luyện 8 Bài Học
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard t={t} label="Câu đã làm" value={progress.totalAnswered} icon={BookOpen} />
        <StatCard t={t} label="Trả lời đúng" value={progress.totalCorrect} icon={CheckCircle2} />
        <StatCard t={t} label="Tỷ lệ chính xác" value={acc + "%"} icon={TrendingUp} />
        <StatCard t={t} label="Chuỗi ngày học" value={progress.streak + " ngày"} icon={Award} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <ActionCard t={t} title="Ôn luyện theo bài (Bài 1 -> 8)" desc="Xem đáp án & giải thích chi tiết cho trọn bộ 80 câu HTX 369" icon={BookOpen} onClick={onPractice} />
        <ActionCard t={t} title="Luyện tập nhanh (20 câu)" desc="Rèn luyện phản xạ ngẫu nhiên từ ngân hàng 80 câu" icon={Zap} onClick={onQuickStart} />
        <ActionCard t={t} title="Thi sát hạch bấm giờ (60 phút)" desc="Mô phỏng thi thực tế 80 câu, tính % điểm và cấp Giấy chứng nhận" icon={Target} onClick={onExam} />
        <ActionCard t={t} title={`Ngân hàng câu sai (${wrongCount})`} desc="Ôn lại những câu bạn từng chọn chưa chính xác" icon={XCircle} onClick={onWrong} />
      </div>

      {progress.history.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-3 flex items-center justify-between" style={{ color: t.ink }}>
            <span>Lịch sử bài thi gần đây</span>
            <span className="text-xs font-normal" style={{ color: t.inkSoft }}>{progress.history.length} lượt thi</span>
          </div>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.border, background: t.surface }}>
            {progress.history.slice(0, 5).map((h, i) => {
              const s = SUBJECTS.find((x) => x.id === h.subjectId);
              const pct = Math.round((h.score / h.total) * 100);
              return (
                <div key={h.id} className="flex items-center justify-between px-4 py-3" style={{ borderTop: i ? `1px solid ${t.border}` : "none" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: t.ink }}>
                      {s ? s.name : "HTX 369"} · <span style={{ color: t.inkSoft }} className="text-xs">{h.mode === "exam" ? "Thi sát hạch" : h.mode === "quick" ? "Luyện nhanh" : "Luyện tập"}</span>
                    </div>
                    <div className="text-xs" style={{ color: t.inkSoft }}>{h.date}</div>
                  </div>
                  <div className="text-sm font-bold" style={{ color: pct >= 70 ? t.correct : pct >= 40 ? t.gold : t.incorrect }}>
                    {h.score}/{h.total} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ t, label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: t.border, background: t.surface }}>
      <Icon size={16} color={t.accent} />
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: t.inkSoft }}>{label}</div>
    </div>
  );
}

function ActionCard({ t, title, desc, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} className="text-left rounded-xl border p-5 transition-all active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-sm"
      style={{ borderColor: t.border, background: t.surface }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: t.accentSoft }}>
        <Icon size={17} color={t.accent} />
      </div>
      <div className="text-sm font-semibold" style={{ color: t.ink }}>{title}</div>
      <div className="text-xs mt-1" style={{ color: t.inkSoft }}>{desc}</div>
    </button>
  );
}

/* ============================== SUBJECT / TOPIC PICKERS ============================== */
function BackRow({ t, onBack, label }) {
  return (
    <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-5 font-medium" style={{ color: t.inkSoft }}>
      <ArrowLeft size={15} /> {label}
    </button>
  );
}

function SubjectPicker({ t, subjects, bank, onBack, onPick }) {
  return (
    <div className="max-w-3xl">
      <BackRow t={t} onBack={onBack} label="Trang chủ" />
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-5">Chọn chương trình học / Đề thi</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((s) => {
          const count = bank.filter((q) => q.subjectId === s.id).length;
          return (
            <button key={s.id} onClick={() => onPick(s)} className="text-left rounded-xl border p-5 hover:-translate-y-0.5 transition-all hover:shadow-sm"
              style={{ borderColor: t.border, background: t.surface }}>
              <div className="w-3 h-3 rounded-full mb-3" style={{ background: s.accent }} />
              <div className="text-base font-semibold" style={{ color: t.ink }}>{s.name}</div>
              <div className="text-xs mt-1" style={{ color: t.inkSoft }}>{count} câu hỏi trắc nghiệm</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopicPicker({ t, subject, topics, bank, onBack, onPick }) {
  return (
    <div className="max-w-3xl">
      <BackRow t={t} onBack={onBack} label="Chọn chương trình khác" />
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-1">{subject.name}</div>
      <p className="text-sm mb-5" style={{ color: t.inkSoft }}>Chọn bài học để bắt đầu ôn luyện chi tiết</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map((tp) => {
          const count = bank.filter((q) => q.topicId === tp.id).length;
          return (
            <button key={tp.id} onClick={() => onPick(tp)} className="text-left rounded-xl border p-5 hover:-translate-y-0.5 transition-all hover:shadow-sm"
              style={{ borderColor: t.border, background: t.surface }}>
              <div className="text-sm font-semibold" style={{ color: t.ink }}>{tp.name}</div>
              <div className="text-xs mt-1" style={{ color: t.inkSoft }}>{count} câu hỏi · Xem giải thích chi tiết lập tức</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuickSetup({ t, subject, onBack, onStart }) {
  const [count, setCount] = useState(20);
  return (
    <div className="max-w-md">
      <BackRow t={t} onBack={onBack} label="Chọn bài khác" />
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-1">Luyện tập nhanh</div>
      <p className="text-sm mb-6" style={{ color: t.inkSoft }}>{subject.name} · Chọn số lượng câu hỏi</p>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[10, 20, 30, 50].map((n) => (
          <button key={n} onClick={() => setCount(n)} className="rounded-lg border py-3 text-sm font-semibold transition-all"
            style={{ borderColor: count === n ? t.accent : t.border, background: count === n ? t.accentSoft : t.surface, color: count === n ? t.accent : t.ink }}>
            {n} câu
          </button>
        ))}
      </div>
      <button onClick={() => onStart(count)} className="w-full rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition-all" style={{ background: t.accent }}>
        Bắt đầu · {count} câu ngẫu nhiên
      </button>
    </div>
  );
}

function ExamSetup({ t, subject, onBack, onStart }) {
  const [count, setCount] = useState(80);
  const [minutes, setMinutes] = useState(60);
  return (
    <div className="max-w-md">
      <BackRow t={t} onBack={onBack} label="Trở về" />
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-1">Thi Sát Hạch HTX 369</div>
      <p className="text-sm mb-6" style={{ color: t.inkSoft }}>Mô phỏng kỳ thi sát hạch chính thức trọn bộ 8 Bài Học</p>

      <div className="text-xs font-semibold mb-2" style={{ color: t.inkSoft }}>SỐ CÂU HỎI</div>
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[20, 40, 60, 80].map((n) => (
          <button key={n} onClick={() => setCount(n)} className="rounded-lg border py-3 text-sm font-semibold transition-all"
            style={{ borderColor: count === n ? t.accent : t.border, background: count === n ? t.accentSoft : t.surface, color: count === n ? t.accent : t.ink }}>
            {n} câu
          </button>
        ))}
      </div>

      <div className="text-xs font-semibold mb-2" style={{ color: t.inkSoft }}>THỜI GIAN LÀM BÀI (PHÚT)</div>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[20, 30, 45, 60].map((n) => (
          <button key={n} onClick={() => setMinutes(n)} className="rounded-lg border py-3 text-sm font-semibold transition-all"
            style={{ borderColor: minutes === n ? t.accent : t.border, background: minutes === n ? t.accentSoft : t.surface, color: minutes === n ? t.accent : t.ink }}>
            {n} phút
          </button>
        ))}
      </div>

      <button onClick={() => onStart(count, minutes)} className="w-full rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition-all" style={{ background: t.accent }}>
        Vào Thi Sát Hạch · {count} câu / {minutes} phút
      </button>
    </div>
  );
}

/* ============================== QUIZ RUNNER ============================== */
function QuizRunner({ t, setup, bookmarkIds, onToggleBookmark, onExit, onFinish }) {
  const { mode, questions, timeLimit, subjectId } = setup;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit || null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);

  const current = questions[idx];
  const total = questions.length;

  useEffect(() => {
    if (mode !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); doSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAnswer = (i) => {
    if (mode === "practice" && answers[current.id] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [current.id]: i }));
    if (mode === "practice") setShowFeedback(true);
  };

  const goNext = () => {
    setShowFeedback(false);
    if (idx < total - 1) setIdx(idx + 1);
    else if (mode !== "exam") doSubmit();
  };
  const goPrev = () => { setShowFeedback(false); if (idx > 0) setIdx(idx - 1); };
  const toggleFlag = () => {
    const next = new Set(flags);
    next.has(current.id) ? next.delete(current.id) : next.add(current.id);
    setFlags(next);
  };
  const skip = () => { setAnswers((prev) => ({ ...prev, [current.id]: "skip" })); goNext(); };

  const doSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const perQuestion = questions.map((qq) => {
      const a = answers[qq.id];
      const answered = a !== undefined && a !== "skip";
      return { id: qq.id, question: qq, selected: answered ? a : null, skipped: a === "skip" || a === undefined, correct: answered ? a === qq.correctIndex : null };
    });
    const correctCount = perQuestion.filter((x) => x.correct).length;
    const wrongCount = perQuestion.filter((x) => x.correct === false).length;
    const skippedCount = perQuestion.filter((x) => x.skipped).length;
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    onFinish({ mode, subjectId, total, correctCount, wrongCount, skippedCount, elapsed, perQuestion });
  };

  if (!current) return null;
  const isBookmarked = bookmarkIds.includes(current.id);
  const selected = answers[current.id];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: t.inkSoft }}>
          <X size={16} /> Thoát
        </button>
        {mode === "exam" && timeLeft !== null && (
          <div className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1 rounded-full border shadow-sm"
            style={{ borderColor: timeLeft < 120 ? t.incorrect : t.border, color: timeLeft < 120 ? t.incorrect : t.ink, background: t.surface }}>
            <Clock size={15} /> {fmtTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className="text-xs font-semibold" style={{ color: t.inkSoft }}>Câu {idx + 1}/{total}</div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: t.accentSoft, color: diffColor(t, current.difficulty) }}>
          {diffLabel[current.difficulty]}
        </span>
      </div>
      <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: t.border }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((idx + 1) / total) * 100}%`, background: t.accent }} />
      </div>

      <div className="rounded-xl border p-5 mb-4 shadow-sm" style={{ borderColor: t.border, background: t.surface }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="text-base font-semibold leading-relaxed" style={{ color: t.ink }}>{current.content}</div>
          <button onClick={() => onToggleBookmark(current.id)} className="shrink-0 mt-0.5 p-1 rounded hover:bg-black/5">
            <Bookmark size={18} color={isBookmarked ? t.gold : t.inkSoft} fill={isBookmarked ? t.gold : "none"} />
          </button>
        </div>

        <div className="space-y-2">
          {current.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrectOpt = i === current.correctIndex;
            let bg = t.bg, border = t.border, color = t.ink;
            if (mode === "practice" && showFeedback) {
              if (isCorrectOpt) { bg = t.correctSoft; border = t.correct; color = t.correct; }
              else if (isSelected) { bg = t.incorrectSoft; border = t.incorrect; color = t.incorrect; }
            } else if (isSelected) { bg = t.accentSoft; border = t.accent; color = t.accent; }
            return (
              <button key={i} onClick={() => selectAnswer(i)} disabled={mode === "practice" && showFeedback}
                className="w-full text-left px-4 py-3 rounded-lg border text-sm flex items-center gap-3 transition-all"
                style={{ background: bg, borderColor: border, color }}>
                <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0" style={{ borderColor: color }}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 font-medium">{opt}</span>
              </button>
            );
          })}
        </div>

        {mode === "practice" && showFeedback && (
          <div className="mt-4 p-3.5 rounded-lg text-sm border" style={{ background: selected === current.correctIndex ? t.correctSoft : t.incorrectSoft, borderColor: selected === current.correctIndex ? t.correct : t.incorrect, color: t.ink }}>
            <div className="font-semibold mb-1" style={{ color: selected === current.correctIndex ? t.correct : t.incorrect }}>
              {selected === current.correctIndex ? "✅ Chính xác!" : `❌ Bạn chọn: ${String.fromCharCode(65 + selected)} · Đáp án đúng: ${String.fromCharCode(65 + current.correctIndex)}`}
            </div>
            <div className="text-xs leading-relaxed mt-1" style={{ color: t.inkSoft }}>💡 <strong>Giải thích chi tiết:</strong> {current.explanation}</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {mode === "exam" && (
            <>
              <button onClick={goPrev} disabled={idx === 0} className="p-2.5 rounded-lg border disabled:opacity-30 transition-all" style={{ borderColor: t.border }}>
                <ChevronLeft size={16} color={t.ink} />
              </button>
              <button onClick={toggleFlag} className="p-2.5 rounded-lg border transition-all" style={{ borderColor: flags.has(current.id) ? t.gold : t.border }}>
                <Flag size={16} color={flags.has(current.id) ? t.gold : t.inkSoft} fill={flags.has(current.id) ? t.gold : "none"} />
              </button>
            </>
          )}
          {mode === "practice" && !showFeedback && (
            <button onClick={skip} className="px-4 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: t.border, color: t.inkSoft }}>Bỏ qua</button>
          )}
        </div>

        {mode === "exam" ? (
          idx === total - 1 ? (
            <button onClick={() => setConfirmSubmit(true)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>
              Nộp bài ({answeredCount}/{total})
            </button>
          ) : (
            <button onClick={goNext} className="flex items-center gap-1 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>
              Câu tiếp theo <ChevronRight size={15} />
            </button>
          )
        ) : (
          <button onClick={goNext} disabled={mode === "practice" && !showFeedback && selected === undefined}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 shadow-sm" style={{ background: t.accent }}>
            {idx === total - 1 ? "Xem kết quả" : "Câu tiếp theo"}
          </button>
        )}
      </div>

      {mode === "exam" && (
        <div className="flex flex-wrap gap-1.5 mt-5 p-3 rounded-xl border max-h-48 overflow-y-auto" style={{ borderColor: t.border, background: t.surface }}>
          {questions.map((qq, i) => {
            const a = answers[qq.id];
            const isCur = i === idx;
            let bg = t.surface, color = t.inkSoft, border = t.border;
            if (flags.has(qq.id)) { border = t.gold; color = t.gold; }
            if (a !== undefined && a !== "skip") { bg = t.accentSoft; color = t.accent; border = t.accent; }
            if (isCur) { bg = t.accent; color = "#fff"; border = t.accent; }
            return (
              <button key={qq.id} onClick={() => { setIdx(i); setShowFeedback(false); }} className="w-7 h-7 rounded-md border text-xs font-semibold transition-all"
                style={{ background: bg, color, borderColor: border }}>{i + 1}</button>
            );
          })}
        </div>
      )}

      {confirmSubmit && (
        <Modal t={t} onClose={() => setConfirmSubmit(false)}>
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} color={t.gold} className="shrink-0 mt-0.5" />
            <div>
              <div className="text-base font-semibold" style={{ color: t.ink }}>Xác nhận nộp bài thi sát hạch?</div>
              <div className="text-xs mt-1 leading-relaxed" style={{ color: t.inkSoft }}>
                Bạn đã trả lời {answeredCount}/{total} câu hỏi. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setConfirmSubmit(false)} className="flex-1 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: t.border, color: t.ink }}>Tiếp tục làm bài</button>
            <button onClick={doSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>Nộp bài ngay</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ t, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border p-5 shadow-lg" style={{ background: t.surface, borderColor: t.border }}>
        {children}
      </div>
    </div>
  );
}

/* ============================== AUTH MODAL ============================== */
function AuthModal({ t, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await registerUser(name, email, password);
        onAuthSuccess(res.user);
      } else {
        const res = await loginUser(email, password);
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal t={t} onClose={onClose}>
      <div className="flex justify-between items-center mb-4">
        <div style={{ fontFamily: serif }} className="text-xl font-bold">
          {isRegister ? "Đăng ký tài khoản" : "Đăng nhập HTX 369"}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-black/5"><X size={16} color={t.inkSoft} /></button>
      </div>

      {error && (
        <div className="mb-4 p-2.5 rounded-lg border text-xs text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {isRegister && (
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: t.inkSoft }}>Họ và tên</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A"
              className="w-full text-sm rounded-lg border px-3 py-2 outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
          </div>
        )}

        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: t.inkSoft }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="thanhvien@htx369.vn"
            className="w-full text-sm rounded-lg border px-3 py-2 outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: t.inkSoft }}>Mật khẩu</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full text-sm rounded-lg border px-3 py-2 outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm mt-2 disabled:opacity-50" style={{ background: t.accent }}>
          {loading ? "Đang xử lý…" : isRegister ? "Đăng ký ngay" : "Đăng nhập"}
        </button>
      </form>

      <div className="mt-4 pt-3 border-t text-center text-xs" style={{ borderColor: t.border, color: t.inkSoft }}>
        {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
        <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="font-semibold underline" style={{ color: t.accent }}>
          {isRegister ? "Đăng nhập ngay" : "Tạo tài khoản mới"}
        </button>
      </div>
    </Modal>
  );
}

/* ============================== CERTIFICATE MODAL ============================== */
function CertificateModal({ t, result, user, onClose }) {
  const pct = Math.round((result.correctCount / result.total) * 100);
  const dateStr = new Date().toLocaleDateString('vi-VN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700">
          <X size={20} />
        </button>

        <div className="text-center border-4 border-dashed border-amber-300 p-6 rounded-xl bg-amber-50/50">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <Award size={32} />
          </div>
          
          <div style={{ fontFamily: serif }} className="text-xs uppercase tracking-widest text-amber-800 font-bold mb-1">
            HỢP TÁC XÃ 369 GROUP
          </div>

          <h2 style={{ fontFamily: serif }} className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            GIẤY CHỨNG NHẬN ĐẠT SÁT HẠCH
          </h2>

          <p className="text-xs text-slate-600 mb-4 italic">
            Chứng nhận hoàn thành tốt chương trình đào tạo & bài kiểm tra trắc nghiệm sát hạch chuẩn HTX 369
          </p>

          <div className="my-4 py-2 border-t border-b border-amber-200">
            <div className="text-xs text-slate-500 font-medium">Cấp cho Học viên:</div>
            <div style={{ fontFamily: serif }} className="text-xl sm:text-2xl font-bold text-emerald-800 my-1">
              {user ? (user.name || user.email) : "Học viên HTX 369"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto my-4 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-amber-200">
              <span className="text-slate-500">Kết quả Sát hạch:</span>
              <div className="font-bold text-emerald-700 text-base">{result.correctCount}/{result.total} câu ({pct}%)</div>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200">
              <span className="text-slate-500">Ngày cấp:</span>
              <div className="font-bold text-slate-800 text-base">{dateStr}</div>
            </div>
          </div>

          <div className="flex justify-between items-end mt-6 text-left text-[11px] text-slate-500 pt-3 border-t border-amber-200">
            <div>
              <div>Mã xác nhận: <strong>HTX369-{uid().toUpperCase()}</strong></div>
              <div>Hệ thống đào tạo trắc nghiệm Ôn Luyện 369</div>
            </div>
            <div className="text-center font-semibold text-emerald-800">
              <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-0.5" />
              ĐÃ XÁC NHẬN ĐẠT
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50">
            <Printer size={15} /> In Giấy Chứng Nhận
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800">
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== RESULTS ============================== */
function ResultsView({ t, result, user, onHome, onReviewWrong, onRetakeWrong, onOpenCert }) {
  const { correctCount, wrongCount, skippedCount, total, elapsed, perQuestion } = result;
  const pct = Math.round((correctCount / total) * 100);
  const isPassed = pct >= 70;

  const byTopic = useMemo(() => {
    const map = {};
    perQuestion.forEach((p) => {
      const key = p.question.topicId;
      const tp = TOPICS.find((x) => x.id === key);
      if (!map[key]) map[key] = { name: tp ? tp.name : key, correct: 0, total: 0 };
      map[key].total += 1;
      if (p.correct) map[key].correct += 1;
    });
    return Object.values(map);
  }, [perQuestion]);

  const wrongList = perQuestion.filter((p) => p.correct === false);

  return (
    <div className="max-w-2xl">
      <div className="text-center mb-8 pt-4">
        <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 border-4 shadow-sm"
          style={{ background: isPassed ? t.correctSoft : pct >= 40 ? "#F5EBD3" : t.incorrectSoft, borderColor: isPassed ? t.correct : pct >= 40 ? t.gold : t.incorrect }}>
          <div style={{ fontFamily: serif, color: isPassed ? t.correct : pct >= 40 ? t.gold : t.incorrect }} className="text-3xl font-bold">{pct}%</div>
        </div>
        
        <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-1">
          {isPassed ? "XÁC NHẬN ĐẠT SÁT HẠCH! 🎉" : pct >= 40 ? "Cố lên nào! 💪" : "Cần ôn tập thêm 📚"}
        </div>
        <p className="text-sm" style={{ color: t.inkSoft }}>
          Bạn đã trả lời đúng {correctCount}/{total} câu trong thời gian {fmtTime(elapsed)}
        </p>

        {isPassed && (
          <button onClick={onOpenCert} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white font-bold text-xs shadow-md hover:bg-amber-600 transition-all">
            <Award size={16} /> Bấm Nhận Giấy Chứng Nhận HTX 369
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8">
        <MiniStat t={t} label="Đúng" value={correctCount} color={t.correct} />
        <MiniStat t={t} label="Sai" value={wrongCount} color={t.incorrect} />
        <MiniStat t={t} label="Bỏ qua" value={skippedCount} color={t.gold} />
        <MiniStat t={t} label="Thời gian" value={fmtTime(elapsed)} color={t.ink} />
      </div>

      {byTopic.length > 1 && (
        <div className="mb-8 p-4 rounded-xl border" style={{ borderColor: t.border, background: t.surface }}>
          <div className="text-sm font-semibold mb-3" style={{ color: t.ink }}>Kết quả theo từng Bài học HTX 369</div>
          <div className="space-y-3">
            {byTopic.map((b, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1" style={{ color: t.inkSoft }}>
                  <span className="font-medium">{b.name}</span>
                  <span>{b.correct}/{b.total} ({Math.round((b.correct / b.total) * 100)}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.border }}>
                  <div className="h-full rounded-full" style={{ width: `${(b.correct / b.total) * 100}%`, background: t.accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongList.length > 0 && (
        <div className="mb-8">
          <div className="text-sm font-semibold mb-3" style={{ color: t.ink }}>Chi tiết các câu chưa làm đúng ({wrongList.length})</div>
          <div className="space-y-3">
            {wrongList.map((p) => (
              <div key={p.id} className="rounded-lg border p-4 shadow-sm" style={{ borderColor: t.border, background: t.surface }}>
                <div className="text-sm font-medium mb-2" style={{ color: t.ink }}>{p.question.content}</div>
                <div className="text-xs font-semibold" style={{ color: t.incorrect }}>
                  ❌ Bạn chọn: {p.selected !== null ? String.fromCharCode(65 + p.selected) + ". " + p.question.options[p.selected] : "Chưa chọn"}
                </div>
                <div className="text-xs font-semibold mt-1" style={{ color: t.correct }}>
                  ✅ Đáp án đúng: {String.fromCharCode(65 + p.question.correctIndex)}. {p.question.options[p.question.correctIndex]}
                </div>
                <div className="text-xs mt-2 leading-relaxed p-2.5 rounded border" style={{ background: t.bg, borderColor: t.border, color: t.inkSoft }}>
                  💡 <strong>Giải thích bài học:</strong> {p.question.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <button onClick={onHome} className="flex-1 py-3 rounded-lg border text-sm font-semibold" style={{ borderColor: t.border, color: t.ink }}>
          Về trang chủ
        </button>
        {wrongList.length > 0 && (
          <button onClick={onRetakeWrong} className="flex-1 py-3 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>
            Làm lại các câu làm sai ({wrongList.length})
          </button>
        )}
      </div>
    </div>
  );
}

function MiniStat({ t, label, value, color }) {
  return (
    <div className="rounded-lg border py-3 text-center" style={{ borderColor: t.border, background: t.surface }}>
      <div style={{ fontFamily: serif, color }} className="text-xl font-bold">{value}</div>
      <div className="text-[10px] mt-0.5 font-medium" style={{ color: t.inkSoft }}>{label}</div>
    </div>
  );
}

/* ============================== WRONG / BOOKMARKS ============================== */
function FilterableList({ t, bank, ids, subjects, topics, onRemove, onPracticeAll, emptyTitle, emptyDesc, title }) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const items = bank.filter((q) => ids.includes(q.id))
    .filter((q) => subjectFilter === "all" || q.subjectId === subjectFilter)
    .filter((q) => diffFilter === "all" || q.difficulty === diffFilter);

  if (ids.length === 0) {
    return (
      <div className="max-w-2xl text-center py-20">
        <div style={{ fontFamily: serif }} className="text-xl font-bold mb-2">{emptyTitle}</div>
        <p className="text-sm" style={{ color: t.inkSoft }}>{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-4">{title} ({items.length})</div>
      <div className="flex flex-wrap gap-2 mb-5">
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="text-xs rounded-lg border px-3 py-2" style={{ borderColor: t.border, background: t.surface, color: t.ink }}>
          <option value="all">Tất cả chương trình</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="text-xs rounded-lg border px-3 py-2" style={{ borderColor: t.border, background: t.surface, color: t.ink }}>
          <option value="all">Mọi độ khó</option>
          <option value="easy">Dễ</option><option value="medium">Trung bình</option><option value="hard">Khó</option>
        </select>
        {items.length > 0 && (
          <button onClick={() => onPracticeAll(items)} className="ml-auto text-xs px-3 py-2 rounded-lg text-white font-semibold shadow-sm" style={{ background: t.accent }}>
            Làm lại tất cả câu này ({items.length})
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map((q) => (
          <div key={q.id} className="rounded-lg border p-4 shadow-sm" style={{ borderColor: t.border, background: t.surface }}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-medium" style={{ color: t.ink }}>{q.content}</div>
              <button onClick={() => onRemove(q.id)} className="p-1 rounded hover:bg-black/5 shrink-0"><Trash2 size={15} color={t.inkSoft} /></button>
            </div>
            <div className="text-xs font-medium mt-2" style={{ color: t.correct }}>Đáp án đúng: {String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}</div>
            <div className="text-xs mt-1" style={{ color: t.inkSoft }}>💡 {q.explanation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WrongQuestions({ t, bank, wrongIds, subjects, topics, onRemove, onPracticeAll }) {
  return <FilterableList t={t} bank={bank} ids={wrongIds} subjects={subjects} topics={topics} onRemove={onRemove} onPracticeAll={onPracticeAll}
    title="Ngân hàng câu hỏi làm sai" emptyTitle="Chưa có câu nào sai 🎉" emptyDesc="Những câu bạn chọn đáp án chưa đúng trong quá trình thi sẽ tự động xuất hiện ở đây để ôn lại." />;
}
function BookmarksView({ t, bank, bookmarkIds, subjects, topics, onRemove, onPracticeAll }) {
  return <FilterableList t={t} bank={bank} ids={bookmarkIds} subjects={subjects} topics={topics} onRemove={onRemove} onPracticeAll={onPracticeAll}
    title="Câu hỏi đã lưu" emptyTitle="Chưa lưu câu hỏi nào 📌" emptyDesc="Nhấn biểu tượng bookmark khi làm bài để lưu câu hỏi quan trọng cần ôn lại." />;
}

/* ============================== ADMIN ============================== */
const emptyForm = { subjectId: SUBJECTS[0].id, topicId: TOPICS[0].id, content: "", options: ["", "", "", ""], correctIndex: 0, explanation: "", difficulty: "easy" };

function AdminPanel({ t, bank, subjects, topics, onChange, progress }) {
  const [tab, setTab] = useState("list");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");

  const filtered = bank.filter((q) => q.content.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setForm(emptyForm); setEditing(null); setTab("form"); };
  const openEdit = (q) => { setForm({ subjectId: q.subjectId, topicId: q.topicId, content: q.content, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation, difficulty: q.difficulty }); setEditing(q.id); setTab("form"); };
  const remove = (id) => onChange(bank.filter((q) => q.id !== id));

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bank, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `onluyen369_questions_${todayStr()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const runImport = () => {
    try {
      const arr = JSON.parse(importText);
      if (!Array.isArray(arr)) throw new Error("not array");
      const valid = arr.filter((x) => x.content && Array.isArray(x.options) && x.options.length === 4 && typeof x.correctIndex === "number");
      const withIds = valid.map((x) => ({
        id: "q" + uid(), subjectId: x.subjectId || subjects[0].id, topicId: x.topicId || topics[0].id,
        content: x.content, options: x.options, correctIndex: x.correctIndex,
        explanation: x.explanation || "", difficulty: x.difficulty || "medium", tags: x.tags || [],
      }));
      onChange([...bank, ...withIds]);
      setImportMsg(`Đã nhập thành công ${withIds.length}/${arr.length} câu hỏi.`);
      setImportText("");
    } catch (e) {
      setImportMsg("Dữ liệu JSON không hợp lệ. Vui lòng kiểm tra lại định dạng.");
    }
  };

  return (
    <div className="max-w-3xl">
      <div style={{ fontFamily: serif }} className="text-2xl font-bold mb-1">Quản trị hệ thống HTX 369</div>
      <p className="text-sm mb-6" style={{ color: t.inkSoft }}>Quản lý ngân hàng 80+ câu hỏi HTX 369, nhập xuất dữ liệu và theo dõi thống kê tổng quan</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard t={t} label="Tổng câu hỏi" value={bank.length} icon={BookOpen} />
        <StatCard t={t} label="Lượt đã làm" value={progress.totalAnswered} icon={TrendingUp} />
        <StatCard t={t} label="Điểm TB" value={(progress.totalAnswered ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0) + "%"} icon={Award} />
      </div>

      <div className="flex justify-between items-center mb-5 border-b" style={{ borderColor: t.border }}>
        <div className="flex gap-2">
          {[["list", "Danh sách câu hỏi"], ["form", editing ? "Sửa câu hỏi" : "Thêm câu hỏi mới"], ["import", "Nhập / Xuất JSON"]].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); if (id === "form" && !editing) setForm(emptyForm); }}
              className="px-3 py-2 text-sm font-medium transition-all" style={{ color: tab === id ? t.accent : t.inkSoft, borderBottom: tab === id ? `2px solid ${t.accent}` : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={exportJSON} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium mb-1" style={{ borderColor: t.border, color: t.ink }}>
          <Download size={13} /> Xuất JSON
        </button>
      </div>

      {tab === "list" && (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 rounded-lg border" style={{ borderColor: t.border, background: t.surface }}>
              <Search size={14} color={t.inkSoft} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm câu hỏi HTX 369…" className="flex-1 py-2 text-sm bg-transparent outline-none" style={{ color: t.ink }} />
            </div>
            <button onClick={openNew} className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>
              <Plus size={14} /> Thêm câu hỏi
            </button>
          </div>
          <div className="space-y-2">
            {filtered.map((q) => {
              const s = subjects.find((x) => x.id === q.subjectId);
              return (
                <div key={q.id} className="rounded-lg border p-3 flex items-start justify-between gap-3 shadow-sm" style={{ borderColor: t.border, background: t.surface }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: t.ink }}>{q.content}</div>
                    <div className="text-xs mt-1 font-medium" style={{ color: t.inkSoft }}>{s ? s.name : ""} · Độ khó: {diffLabel[q.difficulty]}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(q)} className="p-1.5 rounded-md border hover:bg-black/5" style={{ borderColor: t.border }}><Pencil size={13} color={t.inkSoft} /></button>
                    <button onClick={() => remove(q.id)} className="p-1.5 rounded-md border hover:bg-black/5" style={{ borderColor: t.border }}><Trash2 size={13} color={t.incorrect} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "form" && (
        <div className="space-y-4 p-5 rounded-xl border" style={{ borderColor: t.border, background: t.surface }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold" style={{ color: t.inkSoft }}>Môn học / Chương trình</label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value, topicId: topics.find((tp) => tp.subjectId === e.target.value)?.id })}
                className="w-full mt-1 text-sm rounded-lg border px-3 py-2 outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: t.inkSoft }}>Bài học</label>
              <select value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                className="w-full mt-1 text-sm rounded-lg border px-3 py-2 outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }}>
                {topics.filter((tp) => tp.subjectId === form.subjectId).map((tp) => <option key={tp.id} value={tp.id}>{tp.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold" style={{ color: t.inkSoft }}>Nội dung câu hỏi</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} placeholder="Nhập câu hỏi tại đây…"
              className="w-full mt-1 text-sm rounded-lg border px-3 py-2 resize-none outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
          </div>

          <div>
            <label className="text-xs font-semibold" style={{ color: t.inkSoft }}>Các phương án trả lời (chọn hình tròn để chọn đáp án đúng)</label>
            <div className="space-y-2 mt-1">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => setForm({ ...form, correctIndex: i })} className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: form.correctIndex === i ? t.correct : t.border }}>
                    {form.correctIndex === i ? <CheckCircle2 size={16} color={t.correct} /> : <Circle size={14} color={t.inkSoft} />}
                  </button>
                  <input value={opt} onChange={(e) => { const next = [...form.options]; next[i] = e.target.value; setForm({ ...form, options: next }); }}
                    placeholder={`Đáp án ${String.fromCharCode(65 + i)}`} className="flex-1 text-sm rounded-lg border px-3 py-2 outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold" style={{ color: t.inkSoft }}>Giải thích chi tiết đáp án</label>
            <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} placeholder="Giải thích lý do tại sao đáp án này đúng…"
              className="w-full mt-1 text-sm rounded-lg border px-3 py-2 resize-none outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
          </div>

          <div>
            <label className="text-xs font-semibold" style={{ color: t.inkSoft }}>Độ khó câu hỏi</label>
            <div className="flex gap-2 mt-1">
              {["easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setForm({ ...form, difficulty: d })} className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                  style={{ borderColor: form.difficulty === d ? diffColor(t, d) : t.border, color: form.difficulty === d ? diffColor(t, d) : t.inkSoft }}>
                  {diffLabel[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setTab("list")} className="flex-1 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: t.border, color: t.ink }}>Hủy</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>{editing ? "Lưu thay đổi" : "Thêm câu hỏi mới"}</button>
          </div>
        </div>
      )}

      {tab === "import" && (
        <div className="p-5 rounded-xl border" style={{ borderColor: t.border, background: t.surface }}>
          <p className="text-xs mb-3 font-medium" style={{ color: t.inkSoft }}>
            Dán mảng JSON chứa danh sách câu hỏi theo cấu trúc chuẩn bên dưới:
          </p>
          <pre className="text-[11px] p-3 rounded-lg mb-3 font-mono overflow-x-auto" style={{ background: t.bg, color: t.inkSoft }}>
{`[
  {
    "subjectId": "htx369",
    "topicId": "bai-1",
    "content": "Mục đích tối thượng của 369 là gì?",
    "options": ["Tăng doanh số", "Tăng thành viên", "Kiến tạo cuộc sống thịnh vượng...", "Tăng Credit"],
    "correctIndex": 2,
    "explanation": "Đích đến là sự thịnh vượng...",
    "difficulty": "easy"
  }
]`}
          </pre>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={7} placeholder='Dán mảng JSON câu hỏi vào đây...'
            className="w-full text-xs rounded-lg border px-3 py-2 font-mono outline-none" style={{ borderColor: t.border, background: t.bg, color: t.ink }} />
          <div className="flex items-center gap-3 mt-3">
            <button onClick={runImport} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm" style={{ background: t.accent }}>
              <Upload size={14} /> Nhập dữ liệu ngay
            </button>
            {importMsg && <span className="text-xs font-medium" style={{ color: t.inkSoft }}>{importMsg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
