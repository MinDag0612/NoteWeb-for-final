# Chấp Nhận Rủi Ro Bảo Mật

Repository này vẫn giữ cơ chế chặn mức độ nghiêm trọng cao của Trivy cho cả quét source code và quét image.

## Phạm vi exception hiện tại

File exception hiện tại là [`.trivyignore.yaml`](../../.trivyignore.yaml).

Exception này được giới hạn có chủ đích chỉ cho:

- `apps/frontend/package-lock.json`

Các findings đang được chấp nhận tạm thời hiện đến từ chuỗi dependency build cũ của `react-scripts` / CRA dùng để build frontend trong CI. Các package này tồn tại trong dependency graph của source code và trong builder stage, nhưng không được đưa vào frontend runtime image cuối cùng, vốn là Nginx stage trong [`apps/frontend/dockerfile`](../../apps/frontend/dockerfile).

## Vì sao điều này chấp nhận được ở thời điểm hiện tại

- Dự án vẫn thực thi quét Trivy trên image với chế độ chặn `HIGH,CRITICAL`.
- Frontend runtime image cuối cùng chỉ chứa static assets đã build và được phục vụ bởi Nginx, không chứa chính toolchain CRA.
- Các rule ignore được giới hạn theo đường dẫn `apps/frontend/package-lock.json`, thay vì tắt cùng CVE đó trên mọi nơi trong repository.
- Mỗi finding được chấp nhận đều có ngày hết hạn để exception không tồn tại âm thầm vô thời hạn.

## Những khu vực không được chấp nhận exception

Các khu vực sau vẫn là blocking và không có exception:

- lỗ hổng trong backend runtime image
- lỗ hổng trong frontend runtime image
- secret xuất hiện trong source repository
- misconfiguration ngoài những gì được suppress tường minh bởi Trivy

## Chính sách quét image

Quét container image vẫn chặn ở mức `HIGH` và `CRITICAL`, nhưng dùng chính sách `ignore-unfixed` của Trivy.

Điều này là có chủ đích:

- các lỗ hổng runtime/image có bản vá vẫn phải làm fail CI
- các findings chưa có bản vá từ vendor cần được ghi nhận và theo dõi, nhưng không nên khóa pipeline vô thời hạn khi dự án đã dùng base image upstream nhỏ và hợp lý nhất có thể
- cách này giúp security gate giữ được tính hành động, thay vì bị kẹt bởi các vấn đề Debian upstream hoặc dependency transitive mà nhóm chưa có đường remediation trực tiếp

## Kế hoạch loại bỏ exception

Exception này cần được gỡ bỏ bằng một trong các hướng sau:

1. Di chuyển khỏi `react-scripts` / CRA sang một frontend build stack còn được duy trì tốt.
2. Sinh lại dependency graph của frontend với các phiên bản transitive an toàn sau khi cập nhật toolchain.
3. Xóa dần từng rule suppress của Trivy khi upstream packages có thể được nâng cấp mà không làm mất ổn định quá trình build.
