# Kế Hoạch 10 Bước Cho Phase 2 CI Với GitHub Actions

## Summary
Mục tiêu là hoàn thiện một pipeline CI chất lượng cao cho kiến trúc Tier 4, sẵn sàng nối sang Docker Swarm CD sau này, nhưng hiện tại tập trung vào `CI-first single env`. Mọi thay đổi sẽ được thực hiện trên branch `feature/module2-ci`, image push lên Docker Hub với hai repository cố định:
- `nguyenhongphu1/noteweb-frontend`
- `nguyenhongphu1/noteweb-backend`

Sau mỗi bước sẽ dừng, báo kết quả, nêu file/changes chính, trạng thái kiểm chứng, rồi chờ lệnh sang bước tiếp theo.

## Key Changes
1. **Bước 1: Làm repo CI-ready**
   - Nhắc lại bước: dọn repo để CI có thể chạy sạch và không fail vì lỗi hiển nhiên.
   - Loại bỏ secret cứng và side effects khỏi `backend/data/query.py`; chuyển file này thành utility/seed script thủ công dùng env vars, không tự chạy khi import.
   - Sửa các lỗi JSX/React chắc chắn gây warning hoặc fail trong CI: `class` -> `className`, `for` -> `htmlFor`, bỏ `href=""`, dọn `console.log`/debug thừa ở luồng chính.
   - Dọn import/backend code smell rõ ràng trong `backend/main.py` để giảm noise cho lint.
   - Checkpoint hoàn tất: repo không còn hard-coded credential đã phát hiện, frontend source không còn các lỗi JSX cơ bản.

2. **Bước 2: Chuẩn hóa local commands cho CI**
   - Nhắc lại bước: tạo các lệnh chuẩn để GitHub Actions chỉ việc gọi.
   - Frontend: thêm script `lint`, `test:ci`, giữ `build`.
   - Backend: thêm `requirements-dev.txt` với `ruff`, `pytest`, `httpx`, `pytest-cov`; chuẩn bị command lint/test rõ ràng.
   - Không thay đổi public runtime API; chỉ thêm developer interface cho CI.
   - Checkpoint hoàn tất: có bộ lệnh local xác định cho lint, test, build ở cả frontend và backend.

3. **Bước 3: Bổ sung test tối thiểu có giá trị**
   - Nhắc lại bước: thêm test backend tối thiểu để chứng minh CI thực sự kiểm tra hành vi.
   - Tạo test cho health endpoint `GET /` và JWT create/decode path.
   - Mock hoặc cô lập phụ thuộc env khi cần; không phụ thuộc MongoDB thật cho smoke tests này.
   - Checkpoint hoàn tất: backend có test chạy độc lập trong CI, không cần cloud services.

4. **Bước 4: Chạy kiểm chứng local không làm thay đổi repo-tracked behavior**
   - Nhắc lại bước: xác nhận code đã đủ sạch để bước vào workflow authoring.
   - Chạy lint/test/build cục bộ cho frontend và backend; ghi nhận lỗi thực tế còn sót.
   - Nếu có lỗi, sửa trong đúng phạm vi CI-readiness, không mở rộng refactor.
   - Checkpoint hoàn tất: local commands pass hoặc còn đúng các issue đã được chẩn đoán rõ ràng trước khi viết workflow.

5. **Bước 5: Thiết kế và tạo workflow CI chính**
   - Nhắc lại bước: viết `.github/workflows/ci.yml` với cấu trúc rõ ràng, tái lập được.
   - Triggers: `pull_request` và `push` vào `main`; giữ nhánh feature để kiểm thử PR flow.
   - Jobs tách biệt:
     - `frontend-ci`: cache npm, install bằng `npm ci`, lint, test, build, upload artifact.
     - `backend-ci`: cache pip, install deps, lint bằng `ruff`, chạy `pytest`.
     - `security-scan`: scan source repo bằng Trivy cho `vuln,secret,misconfig`, fail ở `HIGH,CRITICAL`.
     - `docker-images`: build cả hai image; chỉ push khi sự kiện phù hợp.
   - Checkpoint hoàn tất: workflow có logic CI đầy đủ theo rubric, chưa cần CD.

6. **Bước 6: Chốt chiến lược tag và publish image**
   - Nhắc lại bước: build/push image với explicit version tags, tuyệt đối không dựa vào `latest`.
   - Dùng Docker Hub repos đã chốt; tag chuẩn:
     - `sha-<shortsha>` là tag triển khai chính
     - `branch-<sanitized-branch>` cho traceability
     - tùy chọn `vX.Y.Z` khi push tag release
   - Với `pull_request`: build để validate nhưng không push.
   - Với `push` vào `main`: build và push.
   - Checkpoint hoàn tất: image naming, tagging, push rules là decision-complete.

7. **Bước 7: Tích hợp security sâu hơn cho container**
   - Nhắc lại bước: không chỉ scan source mà còn scan image sau build.
   - Thêm `trivy image` cho cả frontend/backend image trước khi push hoặc trên image build output.
   - Fail pipeline nếu có `HIGH`/`CRITICAL`; nếu phát sinh false positive, chỉ allowlist bằng cấu hình có giải thích.
   - Checkpoint hoàn tất: security evidence đủ mạnh cho report và demo CI.

8. **Bước 8: Hoàn thiện artifacts và evidence cho chấm điểm**
   - Nhắc lại bước: pipeline phải sinh ra bằng chứng rõ ràng.
   - Upload frontend build artifact, Trivy reports, và nếu khả thi thì SBOM.
   - Workflow logs phải dễ đọc, step names rõ, đủ để quay demo.
   - Checkpoint hoàn tất: artifacts đủ phục vụ technical report, video, và live demo.

9. **Bước 9: Chuẩn bị nền cho CD/Swarm nhưng chưa triển khai CD thật**
   - Nhắc lại bước: thiết kế để sau này nối sang Docker Swarm mà không phải làm lại CI.
   - Chốt secret contract cho tương lai: Docker Hub creds, SSH/Swarm manager creds, image tag consumption bằng `sha-*`.
   - Định nghĩa trước hướng CD sẽ lấy đúng immutable tag từ CI output; chưa thêm deploy job trong giai đoạn này.
   - Checkpoint hoàn tất: CI outputs tương thích trực tiếp với deployment sang Swarm stack.

10. **Bước 10: Git workflow, commit discipline, và tài liệu bàn giao**
   - Nhắc lại bước: hoàn thiện hygiene để merge và demo.
   - Mỗi bước nếu có thay đổi ổn định sẽ commit trên `feature/module2-ci` với message tiếng Anh chuyên nghiệp, thiên về học thuật và mô tả kỹ thuật rõ ràng.
   - Khi cần push, push lên chính branch này.
   - Bổ sung README/notes ngắn nếu cần để nêu cách chạy CI locally, secrets cần cấu hình, và expected workflow behavior.
   - Checkpoint hoàn tất: branch có lịch sử commit sạch, có thể tạo PR để demo CI end-to-end.

## Test Plan
- Frontend:
  - `npm ci`
  - `npm run lint`
  - `npm run test:ci`
  - `npm run build`
- Backend:
  - `pip install -r backend/requirements.txt -r backend/requirements-dev.txt`
  - `ruff check backend`
  - `pytest`
- Security:
  - `trivy fs` trên source repo
  - `trivy image` trên cả hai image build output
- CI acceptance:
  - PR trigger chạy lint/test/build/security nhưng không push image.
  - Push vào `main` chạy toàn bộ CI và push image với tag `sha-*` và `branch-*`.

## Public Interfaces / Contracts
- Thêm scripts frontend cho CI: `lint`, `test:ci`.
- Thêm backend developer dependency contract qua `requirements-dev.txt`.
- Thêm GitHub Actions workflow contract qua `.github/workflows/ci.yml`.
- Thêm Docker image publishing contract:
  - `nguyenhongphu1/noteweb-frontend:sha-<shortsha>`
  - `nguyenhongphu1/noteweb-backend:sha-<shortsha>`
- Không thay đổi API web public của ứng dụng, trừ việc làm sạch implementation để phù hợp CI.

## Assumptions
- Làm việc trên branch `feature/module2-ci`; branch đã tồn tại local và remote-tracking đã hiện diện.
- Registry dùng Docker Hub, không dùng GHCR.
- Phase hiện tại chỉ hoàn thiện CI; CD sang Swarm chỉ chuẩn bị interface và input/output contract.
- `backend/data/query.py` sẽ được giữ như utility script thủ công, không bị xóa khỏi repo.
- Nếu cần commit trong quá trình thực thi, commit message sẽ bằng tiếng Anh, ngắn gọn, chính xác, và chuyên nghiệp.
