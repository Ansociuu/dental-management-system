# Selenium IDE Commands Cho UC2

Base URL:

```text
http://localhost:5173
```

Luu y:

- Nen dung `send keys` thay cho `type` voi React input.
- Neu command nhap ngay/gio khong an dinh, hay click vao input truoc roi moi `send keys`.
- Cac test case can dang nhap nen chay test `Login admin` truoc, hoac them cac command login vao dau test.
- Do source hien co mot so text tieng Viet bi loi encoding, nen uu tien assert bang selector/du lieu test thay vi assert text co dau.

## Login Admin

| Command | Target | Value |
| --- | --- | --- |
| open | /login | |
| pause | 1000 | |
| wait for element visible | css=input[type="email"] | 30000 |
| click | css=input[type="email"] | |
| send keys | css=input[type="email"] | admin@mec.vn |
| click | css=input[type="password"] | |
| send keys | css=input[type="password"] | 123456 |
| click | css=button[type="submit"] | |
| wait for element visible | css=aside | 30000 |

## UC2.1 - Thiet Lap Ngay Nghi

### UC2.1_FUNC_001 - Them Ngay Nghi Hop Le

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| wait for element visible | xpath=//button[.//span[normalize-space(.)='add']] | 30000 |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| click | css=form input[type="text"] | |
| send keys | css=form input[type="text"] | Selenium IDE Holiday Valid |
| click | xpath=(//form//input[@type='date'])[1] | |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-01-10 |
| click | xpath=(//form//input[@type='date'])[2] | |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-01-12 |
| click | css=form textarea | |
| send keys | css=form textarea | Test ngay nghi hop le |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |
| assert element present | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | |

### UC2.1_FUNC_002 - Bo Trong Ten Ngay Nghi

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| click | xpath=(//form//input[@type='date'])[1] | |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-02-10 |
| click | xpath=(//form//input[@type='date'])[2] | |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-02-12 |
| click | css=form button[type="submit"] | |
| assert element present | css=form input[type="text"]:invalid | |

### UC2.1_FUNC_003 - Bo Trong Ngay Bat Dau

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| click | css=form input[type="text"] | |
| send keys | css=form input[type="text"] | Selenium IDE Missing Start |
| click | xpath=(//form//input[@type='date'])[2] | |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-03-12 |
| click | css=form button[type="submit"] | |
| assert element present | xpath=(//form//input[@type='date'])[1][@required] | |

### UC2.1_FUNC_004 - Ngay Ket Thuc Nho Hon Ngay Bat Dau

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="text"] | Selenium IDE Invalid Range |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-04-10 |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-04-08 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-600, .text-rose-700 | 10000 |

### UC2.1_FUNC_005 - Trung Khoang Thoi Gian Ngay Nghi

Tao ngay nghi goc:

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="text"] | Selenium IDE Overlap Base |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-05-10 |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-05-12 |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |

Tao ngay nghi trung:

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="text"] | Selenium IDE Overlap |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-05-11 |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-05-13 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-600, .text-rose-700 | 10000 |

### UC2.1_FUNC_006 - Chinh Sua Ngay Ket Thuc

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| wait for element visible | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | 30000 |
| mouse over | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | |
| click | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]]//button[1] | |
| wait for element visible | css=form | 10000 |
| click | xpath=(//form//input[@type='date'])[2] | |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-01-15 |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |
| assert element present | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | |

### UC2.1_FUNC_007 - Ngung Ap Dung Ngay Nghi ACTIVE

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| wait for element visible | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | 30000 |
| mouse over | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | |
| click | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]]//button[2] | |
| pause | 1000 | |
| assert element present | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | |

### UC2.1_FUNC_008 - Ngay Nghi ACTIVE Chan Dat Lich Kham

Tao ngay nghi ACTIVE truoc:

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="text"] | Selenium IDE Booking Block |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-06-10 |
| send keys | xpath=(//form//input[@type='date'])[2] | 2042-06-10 |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |

Sau do record thu cong tren man hinh dat lich:

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/book | |
| wait for element visible | css=form | 30000 |
| send keys | css=input[placeholder*="tên"], css=input[placeholder*="Tìm"] | tu khoa benh nhan |
| click | xpath=(//form//input[@type='date'])[1] | |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-06-10 |
| select | css=form select | index=1 |
| select | xpath=(//form//select)[2] | index=1 |
| select | xpath=(//form//select)[3] | index=1 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-700, .text-rose-600 | 10000 |

Neu cac dropdown khong co option, can tao lich truc bac si hop le cho ngay khong phai ngay nghi truoc, hoac test case nay nen chay bang Selenium WebDriver/API nhu script `qa/e2e/holiday-settings.mjs`.

### UC2.1_FUNC_009 - Ngay Nghi ACTIVE Chan Dang Ky Lich Truc Bac Si

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/duty-schedules | |
| wait for element visible | xpath=//button[.//span[normalize-space(.)='add']] | 30000 |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| select | xpath=(//form//select)[1] | index=1 |
| click | css=form input[type="date"] | |
| send keys | css=form input[type="date"] | 2042-06-10 |
| select | xpath=(//form//select)[2] | index=1 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-600, .text-rose-700 | 10000 |

### UC2.1_FUNC_010 - Khong Xoa Cung Ngay Nghi

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/holidays | |
| wait for element visible | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | 30000 |
| assert element not present | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]]//button[.//span[normalize-space(.)='delete']] | |
| assert element present | xpath=//tr[td[contains(., 'Selenium IDE Holiday Valid')]] | |

## UC2.2 - Thiet Lap Ca Lam Viec

### UC2.2_FUNC_001 - Them Ca Hop Le

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/shifts | |
| wait for element visible | xpath=//button[.//span[normalize-space(.)='add']] | 30000 |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="text"] | Selenium IDE Ca Sang |
| send keys | xpath=(//form//input[@type='time'])[1] | 07:30 |
| send keys | xpath=(//form//input[@type='time'])[2] | 11:30 |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |
| assert element present | xpath=//*[contains(., 'Selenium IDE Ca Sang')] | |

### UC2.2_FUNC_002 - Gio Ket Thuc Nho Hon Gio Bat Dau

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/shifts | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="text"] | Selenium IDE Ca Sai Gio |
| send keys | xpath=(//form//input[@type='time'])[1] | 13:00 |
| send keys | xpath=(//form//input[@type='time'])[2] | 11:00 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-600, .text-rose-700 | 10000 |

### UC2.2_FUNC_006 - Bo Trong Ten Ca

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/shifts | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | xpath=(//form//input[@type='time'])[1] | 08:00 |
| send keys | xpath=(//form//input[@type='time'])[2] | 12:00 |
| click | css=form button[type="submit"] | |
| assert element present | css=form input[type="text"]:invalid | |

### UC2.2_FUNC_007 - Chinh Sua Ca

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/shifts | |
| wait for element visible | xpath=//*[contains(., 'Selenium IDE Ca Sang')] | 30000 |
| mouse over | xpath=//*[contains(., 'Selenium IDE Ca Sang')]/ancestor::div[contains(@class,'group')][1] | |
| click | xpath=(//*[contains(., 'Selenium IDE Ca Sang')]/ancestor::div[contains(@class,'group')][1]//button)[1] | |
| wait for element visible | css=form | 10000 |
| click | css=form input[type="text"] | |
| send keys | css=form input[type="text"] |  Updated |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |

## UC2.3 - Lich Truc Bac Si

### UC2.3_FUNC_001 - Dang Ky Lich Truc Hop Le

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/duty-schedules | |
| wait for element visible | xpath=//button[.//span[normalize-space(.)='add']] | 30000 |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| select | xpath=(//form//select)[1] | index=1 |
| send keys | css=form input[type="date"] | 2042-07-10 |
| select | xpath=(//form//select)[2] | index=1 |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |

### UC2.3_FUNC_002 - Trung Lich Truc

Chay lai dung command cua `UC2.3_FUNC_001` voi cung bac si, cung ngay `2042-07-10`, cung ca.

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/duty-schedules | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| select | xpath=(//form//select)[1] | index=1 |
| send keys | css=form input[type="date"] | 2042-07-10 |
| select | xpath=(//form//select)[2] | index=1 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-600, .text-rose-700 | 10000 |

### UC2.3_FUNC_005 - Khong Chon Bac Si

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/duty-schedules | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| send keys | css=form input[type="date"] | 2042-07-11 |
| select | xpath=(//form//select)[2] | index=1 |
| click | css=form button[type="submit"] | |
| assert element present | xpath=(//form//select)[1][@required] | |

### UC2.3_FUNC_006 - Khong Chon Ca Truc

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/duty-schedules | |
| click | xpath=//button[.//span[normalize-space(.)='add']] | |
| wait for element visible | css=form | 10000 |
| select | xpath=(//form//select)[1] | index=1 |
| send keys | css=form input[type="date"] | 2042-07-12 |
| click | css=form button[type="submit"] | |
| assert element present | xpath=(//form//select)[2][@required] | |

## UC2.4 - Dat Lich Kham

Do man hinh dat lich phu thuoc du lieu benh nhan, ca truc, bac si va dich vu, nen nen record thu cong sau khi seed data. Khung command:

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/book | |
| wait for element visible | css=form | 30000 |
| click | css=input[placeholder*="T"] | |
| send keys | css=input[placeholder*="T"] | Nguyen |
| click | xpath=(//form//button)[1] | |
| send keys | xpath=(//form//input[@type='date'])[1] | 2042-08-10 |
| select | xpath=(//form//select)[1] | index=1 |
| select | xpath=(//form//select)[2] | index=1 |
| select | xpath=(//form//select)[3] | index=1 |
| send keys | css=form textarea | Test dat lich bang Selenium IDE |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-emerald-700, .text-rose-700 | 10000 |

## UC2.5 - Theo Doi Lich Kham

### Loc Lich Theo Ngay/Bac Si/Trang Thai

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/monitor | |
| wait for element visible | css=input[type="date"] | 30000 |
| send keys | css=input[type="date"] | 2042-08-10 |
| select | xpath=(//select)[1] | index=1 |
| select | xpath=(//select)[3] | label=Chờ xác nhận |
| wait for element visible | css=table, body | 10000 |

### Xac Nhan Lich Kham

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/monitor | |
| wait for element visible | xpath=//button[contains(., 'Xác nhận')] | 30000 |
| click | xpath=//button[contains(., 'Xác nhận')] | |
| pause | 1000 | |
| assert element present | css=body | |

### Check-in Lich Kham

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/appointments/monitor | |
| wait for element visible | xpath=//button[contains(., 'Check-in')] | 30000 |
| click | xpath=//button[contains(., 'Check-in')] | |
| pause | 1000 | |
| assert element present | css=body | |

## UC2.6 - Quan Ly Benh Nhan

### UC2.6_FUNC_001 - Them Benh Nhan Hop Le

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| wait for element visible | xpath=//button[.//span[normalize-space(.)='person_add']] | 30000 |
| click | xpath=//button[.//span[normalize-space(.)='person_add']] | |
| wait for element visible | css=form | 10000 |
| send keys | xpath=(//form//input)[1] | Selenium IDE Patient |
| send keys | xpath=(//form//input)[2] | 0987654321 |
| send keys | xpath=(//form//input[@type='date'])[1] | 1990-05-15 |
| select | css=form select | label=Nam |
| send keys | xpath=(//form//input)[4] | 12 Le Loi |
| click | css=form button[type="submit"] | |
| wait for element not present | css=form | 10000 |
| assert element present | xpath=//*[contains(., 'Selenium IDE Patient')] | |

### UC2.6_FUNC_002 - So Dien Thoai Trung

Chay lai form them benh nhan voi SĐT `0987654321`:

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| click | xpath=//button[.//span[normalize-space(.)='person_add']] | |
| wait for element visible | css=form | 10000 |
| send keys | xpath=(//form//input)[1] | Selenium IDE Patient Duplicate |
| send keys | xpath=(//form//input)[2] | 0987654321 |
| send keys | xpath=(//form//input[@type='date'])[1] | 1991-01-01 |
| click | css=form button[type="submit"] | |
| wait for element visible | css=.text-rose-600, .text-rose-700 | 10000 |

### UC2.6_FUNC_003 - Bo Trong Ho Ten

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| click | xpath=//button[.//span[normalize-space(.)='person_add']] | |
| wait for element visible | css=form | 10000 |
| send keys | xpath=(//form//input)[2] | 0911111111 |
| send keys | xpath=(//form//input[@type='date'])[1] | 1990-01-01 |
| click | css=form button[type="submit"] | |
| assert element present | xpath=(//form//input)[1][@required] | |

### UC2.6_FUNC_004 - Bo Trong So Dien Thoai

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| click | xpath=//button[.//span[normalize-space(.)='person_add']] | |
| wait for element visible | css=form | 10000 |
| send keys | xpath=(//form//input)[1] | Selenium IDE Missing Phone |
| send keys | xpath=(//form//input[@type='date'])[1] | 1990-01-01 |
| click | css=form button[type="submit"] | |
| assert element present | xpath=(//form//input)[2][@required] | |

### UC2.6_FUNC_009 - Tim Kiem Theo Ten

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| wait for element visible | css=input[placeholder*="T"] | 30000 |
| send keys | css=input[placeholder*="T"] | Selenium IDE Patient |
| pause | 1000 | |
| assert element present | xpath=//*[contains(., 'Selenium IDE Patient')] | |

### UC2.6_FUNC_010 - Tim Kiem Theo So Dien Thoai

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| wait for element visible | css=input[placeholder*="T"] | 30000 |
| send keys | css=input[placeholder*="T"] | 0987654321 |
| pause | 1000 | |
| assert element present | xpath=//*[contains(., '0987654321')] | |

### UC2.6_FUNC_011 - Tim Kiem Khong Co Ket Qua

| Command | Target | Value |
| --- | --- | --- |
| open | /admin/customers | |
| wait for element visible | css=input[placeholder*="T"] | 30000 |
| send keys | css=input[placeholder*="T"] | Zzz999NotFound |
| pause | 1000 | |
| assert element present | xpath=//*[contains(., 'Kh') or contains(., 'tim')] | |

