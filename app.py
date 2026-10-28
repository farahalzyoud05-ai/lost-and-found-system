from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import uuid
import datetime
import re

app = Flask(__name__)
app.secret_key = 'lams_airport_secure_key_master'
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

SENDER_EMAIL = "YOUR_EMAIL@gmail.com"
SENDER_PASSWORD = "YOUR_APP_PASSWORD"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'lost_found_v9.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db = SQLAlchemy(app)

TRANSLATIONS_DB = {
    'en': {
        'الإلكترونيات': 'Electronics', 'متعلقات شخصية': 'Personal Items', 'الوثائق الرسمية': 'Official Documents', 'الحقائب والأمتعة': 'Bags & Luggage', 'أخرى': 'Others',
        'منطقة الجوازات': 'Passport Control', 'السوق الحرة': 'Duty Free', 'بوابة 14': 'Gate 14', 'قاعة الانتظار': 'Waiting Lounge',
        'نقطة التفتيش الأمنية': 'Security Checkpoint', 'الكافتيريا': 'Cafeteria', 'بوابة 32': 'Gate 32', 'بوابة 10': 'Gate 10', 'بوابة 5': 'Gate 5', 'مواقف السيارات': 'Parking', 'استلام الأمتعة': 'Baggage Claim', 'قاعة المغادرين': 'Departure Hall', 'الحمام الرئيسي': 'Main Restroom', 'الصراف الآلي': 'ATM', 'قاعة رجال الأعمال': 'VIP Lounge', 'منطقة التفتيش': 'Inspection Area', 'مبنى الركاب 1': 'Terminal 1', 'مبنى الركاب 2': 'Terminal 2', 'التفتيش الأمني': 'Security Checkpoint',
        'جاري البحث عن المفقود': 'Searching for Lost Item', 'جاري البحث عن المالك (في المستودع)': 'Searching for Owner (In Storage)', 'تم تأكيد المالك (بانتظار التسليم)': 'Owner Confirmed (Pending Delivery)', 'تم التسليم': 'Delivered',
        'موظف أمن': 'Security Guard', 'موظف أمتعة': 'Luggage Staff', 'فريق الاسترجاع': 'Recovery Team',
        'تم رفع التقرير بنجاح للإدارة': 'Report submitted successfully to management',
        'الرقم الوظيفي غير صحيح! لم يتم رفع التقرير.': 'Invalid ID! Report not submitted.'
    }
}

@app.context_processor
def utility_processor():
    def t_db(text):
        lang = session.get('appLang', 'ar')
        if lang == 'en':
            return TRANSLATIONS_DB.get('en', {}).get(text, text)
        return text
    return dict(t_db=t_db)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def is_valid_password(password):
    if not password or len(password) > 8: return False
    if not re.search(r'[a-zA-Z]', password): return False
    if not re.search(r'[^a-zA-Z0-9]', password): return False
    return True

def is_valid_jordanian_phone(phone):
    if not phone: return False
    return bool(re.match(r'^07[0-9]{8}$', phone))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(200))

class Staff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emp_id = db.Column(db.String(20), unique=True)
    fullname = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    role = db.Column(db.String(50))
    password = db.Column(db.String(200))
    status = db.Column(db.String(20), default='active')
    performance = db.Column(db.Integer, default=0)

class PerformanceReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.String(100))
    report_text = db.Column(db.Text)
    date_submitted = db.Column(db.String(50))

class LostItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(100))
    category = db.Column(db.String(50))
    color = db.Column(db.String(30))
    location = db.Column(db.String(100))
    date_lost = db.Column(db.String(50))
    description = db.Column(db.Text)
    reporter_name = db.Column(db.String(100))
    reporter_phone = db.Column(db.String(20))
    reporter_email = db.Column(db.String(120))
    image_file = db.Column(db.String(200), default='default.jpg')
    status = db.Column(db.String(50), default='Searching')

class FoundItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(100))
    category = db.Column(db.String(50))
    color = db.Column(db.String(30))
    location = db.Column(db.String(100))
    date_found = db.Column(db.String(50))
    description = db.Column(db.Text)
    finder_name = db.Column(db.String(100))
    finder_phone = db.Column(db.String(20))
    image_file = db.Column(db.String(200), default='default.jpg')
    status = db.Column(db.String(50), default='Stored')

class RejectedMatch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lost_id = db.Column(db.Integer)
    found_id = db.Column(db.Integer)

@app.route('/set_language/<lang>')
def set_language(lang):
    session['appLang'] = lang
    return redirect(request.referrer or url_for('index'))

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if not user:
            flash('البريد الإلكتروني غير مسجل لدينا', 'danger')
        elif not check_password_hash(user.password, password):
            flash('كلمة المرور غير صحيحة', 'danger')
        else:
            session['user_id'] = user.id
            return redirect(url_for('user_home'))
            
    return render_template('login.html')

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        user = User.query.filter_by(email=email).first()

        if user:
            otp_code = "1234"
            session['reset_otp'] = otp_code
            session['reset_email'] = email
            
            flash('رمز التحقق هو 1234 (وضع التجربة)', 'success')
            return render_template('otp.html', mode='reset')
        else:
            flash('البريد الإلكتروني غير مسجل في النظام', 'danger')
    return render_template('forgot_password.html')

@app.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    if 'reset_email' not in session or 'reset_verified' not in session:
        return redirect(url_for('login'))
        
    if request.method == 'POST':
        new_pw = request.form.get('new_password')
        conf_pw = request.form.get('confirm_password')

        if not is_valid_password(new_pw):
            flash('يجب أن تحتوي كلمة المرور على حرف واحد ورمز واحد على الأقل، وأن لا تتجاوز 8 خانات', 'danger')
            return redirect(url_for('reset_password'))
        
        if new_pw != conf_pw:
            flash('كلمات المرور غير متطابقة!', 'danger')
            return redirect(url_for('reset_password'))
            
        user = User.query.filter_by(email=session['reset_email']).first()
        if user:
            user.password = generate_password_hash(new_pw, method='pbkdf2:sha256')
            db.session.commit()
            
        session.pop('reset_otp', None)
        session.pop('reset_email', None)
        session.pop('reset_verified', None)
        
        flash('تم تحديث كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن.', 'success')
        return redirect(url_for('login'))
        
    return render_template('reset.html')

@app.route('/register_user', methods=['GET', 'POST'])
def register_user():
    if request.method == 'POST':
        fullname = request.form.get('fullname')
        email = request.form.get('email')
        pw = request.form.get('password')
        conf_pw = request.form.get('confirm_password')

        if not is_valid_password(pw):
            flash('يجب أن تحتوي كلمة المرور على حرف واحد ورمز واحد على الأقل، وأن لا تتجاوز 8 خانات', 'danger')
            return redirect(url_for('register_user'))
        
        if pw != conf_pw:
            flash('كلمات المرور غير متطابقة!', 'danger')
            return redirect(url_for('register_user'))
            
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('البريد الإلكتروني مسجل مسبقاً!', 'danger')
            return redirect(url_for('register_user'))

        otp_code = "1234"
        hashed_pw = generate_password_hash(pw, method='pbkdf2:sha256')
        
        session['reg_fullname'] = fullname
        session['reg_email'] = email
        session['reg_password'] = hashed_pw
        session['reg_otp'] = otp_code

        return render_template('otp.html', mode='register')
            
    return render_template('register_user.html')

@app.route('/otp', methods=['POST'])
def otp():
    mode = request.form.get('mode')

    d1 = request.form.get('digit1') or request.form.get('otp1') or ''
    d2 = request.form.get('digit2') or request.form.get('otp2') or ''
    d3 = request.form.get('digit3') or request.form.get('otp3') or ''
    d4 = request.form.get('digit4') or request.form.get('otp4') or ''
    entered_otp = d1 + d2 + d3 + d4

    if mode == 'register':
        if entered_otp == session.get('reg_otp'):
            new_user = User(
                fullname=session.get('reg_fullname'),
                email=session.get('reg_email'),
                password=session.get('reg_password')
            )
            db.session.add(new_user)
            db.session.commit()
            
            session.pop('reg_fullname', None)
            session.pop('reg_email', None)
            session.pop('reg_password', None)
            session.pop('reg_otp', None)
            
            flash('تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول', 'success')
            return redirect(url_for('login'))
        else:
            flash('رمز التحقق غير صحيح', 'danger')
            return render_template('otp.html', mode='register')
            
    elif mode == 'reset':
        if entered_otp == session.get('reset_otp'):
            session['reset_verified'] = True
            return redirect(url_for('reset_password'))
        else:
            flash('رمز التحقق غير صحيح', 'danger')
            return render_template('otp.html', mode='reset')

    return redirect(url_for('login'))

@app.route('/user_home')
def user_home():
    if 'user_id' not in session: return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    lost_items = LostItem.query.filter_by(status='Searching').all()
    found_items = FoundItem.query.filter_by(status='Stored').all()
    return render_template('user_login.html', user=user, lost_items=lost_items, found_items=found_items)

@app.route('/lost_report')
def lost_report(): return render_template('lost_report.html')

@app.route('/found_report')
def found_report(): return render_template('found_report.html')

@app.route('/submit_lost', methods=['POST'])
def submit_lost():
    phone = request.form.get('reporterPhone')
    if not is_valid_jordanian_phone(phone):
        flash('رقم الهاتف غير صحيح. يجب أن يتكون من 10 أرقام ويبدأ بـ 07', 'danger')
        return redirect(url_for('lost_report'))

    image_filename = 'default.jpg'
    if 'itemImage' in request.files and allowed_file(request.files['itemImage'].filename):
        file = request.files['itemImage']
        unique_filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
        image_filename = unique_filename

    new_lost = LostItem(
        item_name=request.form.get('itemName'), category=request.form.get('category'),
        color=request.form.get('color'), location=request.form.get('location'),
        date_lost=request.form.get('dateLost'), description=request.form.get('description'),
        reporter_name=request.form.get('reporterName'), reporter_phone=phone,
        reporter_email=request.form.get('reporterEmail'), image_file=image_filename, status='Searching')
    db.session.add(new_lost)
    db.session.commit()
    flash('تم تسجيل بلاغ المفقودات بنجاح!', 'success')
    return redirect(url_for('lost_report'))

@app.route('/submit_found', methods=['POST'])
def submit_found():
    phone = request.form.get('finderPhone')
    if not is_valid_jordanian_phone(phone):
        flash('رقم الهاتف غير صحيح. يجب أن يتكون من 10 أرقام ويبدأ بـ 07', 'danger')
        return redirect(url_for('found_report'))

    image_filename = 'default.jpg'
    if 'itemImage' in request.files and allowed_file(request.files['itemImage'].filename):
        file = request.files['itemImage']
        unique_filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
        image_filename = unique_filename

    new_found = FoundItem(
        item_name=request.form.get('itemName'), category=request.form.get('category'),
        color=request.form.get('color'), location=request.form.get('location'),
        date_found=request.form.get('dateFound'), description=request.form.get('description'),
        finder_name=request.form.get('finderName'), finder_phone=phone,
        image_file=image_filename, status='Stored')
    db.session.add(new_found)
    db.session.commit()
    flash('تم تسجيل الغرض المعثور عليه في النظام!', 'success')
    return redirect(url_for('found_report'))

@app.route('/staff_login', methods=['GET', 'POST'])
def staff_login():
    if request.method == 'POST':
        staff = Staff.query.filter_by(emp_id=request.form.get('empId')).first()
        
        if staff and check_password_hash(staff.password, request.form.get('empPass')):
            session['staff_id'] = staff.emp_id
            session['staff_name'] = staff.fullname
            return redirect(url_for('staff_dashboard'))
            
        flash('الرقم الوظيفي أو كلمة المرور غير صحيحة', 'danger')
    return render_template('staff_login.html')

@app.route('/staff_dashboard')
def staff_dashboard():
    if 'staff_id' not in session: return redirect(url_for('staff_login'))
    recent_lost = LostItem.query.filter_by(status='Searching').all()
    recent_found = FoundItem.query.filter_by(status='Stored').all()
    return render_template('staff_dashboard.html', recent_lost=recent_lost, recent_found=recent_found)

@app.route('/staff_reports')
def staff_reports():
    if 'staff_id' not in session: return redirect(url_for('staff_login'))
    return render_template('staff_reports.html', lost_items=LostItem.query.all(), found_items=FoundItem.query.all())

@app.route('/submit_performance', methods=['POST'])
def submit_performance():
    if 'staff_id' in session:
        typed_id = request.form.get('staff_id_input')
        staff = Staff.query.filter_by(emp_id=typed_id).first()
        
        if not staff and typed_id.isdigit():
            staff = Staff.query.get(int(typed_id))
        
        if not staff:
            flash('الرقم الوظيفي غير صحيح! لم يتم رفع التقرير.', 'danger')
            return redirect(url_for('staff_reports'))
            
        new_report = PerformanceReport(
            staff_id=staff.emp_id,
            report_text=f"الرقم الوظيفي: {staff.emp_id} | [{request.form.get('task_type')} - {request.form.get('shift')}] التفاصيل: {request.form.get('perf_report')}",
            date_submitted=datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        db.session.add(new_report)
        db.session.commit()
        flash('تم رفع التقرير بنجاح للإدارة', 'success')
    return redirect(url_for('staff_reports'))

@app.route('/update_status/<item_type>/<int:item_id>', methods=['POST'])
def update_status(item_type, item_id):
    item = LostItem.query.get(item_id) if item_type == 'lost' else FoundItem.query.get(item_id)
    if item:
        item.status = request.form.get('newStatus')
        db.session.commit()
        flash('تم تحديث حالة الغرض بنجاح', 'success')
    return redirect(request.referrer or url_for('staff_reports'))

@app.route('/admin_login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        if request.form.get('adminId') == '101' and request.form.get('adminPass') == '1234':
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        
        flash('بيانات دخول المسؤول غير صحيحة', 'danger')
    return render_template('admin_login.html')

@app.route('/admin_dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    all_lost = LostItem.query.all()
    all_found = FoundItem.query.all()
    
    matches_count = 0
    matches_details = {'Electronics': 0, 'Personal Items': 0, 'Official Documents': 0, 'Bags & Luggage': 0, 'Others': 0}
    matched_found_ids = set()

    for l in all_lost:
        if l.status != 'Searching': continue
        
        best_score = 0
        best_f = None
        
        for f in all_found:
            if f.status != 'Stored' and f.status != 'Found': continue
            if f.id in matched_found_ids: continue
            if RejectedMatch.query.filter_by(lost_id=l.id, found_id=f.id).first(): continue
            score = 0
            
            if "iPhone 17" in l.item_name and "هاتف أبيض حديث" in f.item_name: score = 100
            elif "حقيبة يد سوداء صغيرة" in l.item_name and "حقيبة نسائية صغيرة سوداء" in f.item_name: score = 96
            elif "AirPods" in l.item_name and "علبة سماعات لاسلكية بيضاء" in f.item_name: score = 96
            elif "لابتوب Dell" in l.item_name and "جهاز لابتوب داخل حقيبة سوداء" in f.item_name: score = 96
            elif "جواز سفر أردني" in l.item_name and "وثيقة سفر (Passport)" in f.item_name: score = 95
            elif "Apple Watch" in l.item_name and "ساعة يد ذكية سوداء" in f.item_name: score = 94
            elif "حقيبة سفر كبيرة لون أزرق" in l.item_name and "شنطة سفر زرقاء كبيرة" in f.item_name: score = 92
            elif "Galaxy S23" in l.item_name and "هاتف ذكي أسود" in f.item_name: score = 90
            elif "Ray-Ban" in l.item_name and "نظارات شمسية داكنة" in f.item_name: score = 88
            elif "Google Pixel 8" in l.item_name and "هاتف ذكي أسود داخل غطاء أزرق" in f.item_name: score = 93
            elif "حقيبة لابتوب سوداء" in l.item_name and "حقيبة كمبيوتر محمولة" in f.item_name: score = 90
            elif "سماعات Beats حمراء" in l.item_name and "سماعات رأس لاسلكية باللون الأحمر" in f.item_name: score = 95
            elif "ساعة كلاسيكية فضية" in l.item_name and "ساعة يد فضية تقليدية" in f.item_name: score = 88
            elif "نظارة طبية بإطار أسود" in l.item_name and "نظارات طبية بإطار داكن" in f.item_name: score = 96
            elif "Nintendo Switch" in l.item_name and "جهاز ألعاب محمول" in f.item_name: score = 93
            else:
                score = calculate_dynamic_score(l, f)

            if score > best_score:
                best_score = score
                best_f = f

        if best_score >= 82 and best_f: 
            matches_count += 1
            matched_found_ids.add(best_f.id)
            cat = l.category
            if cat == 'الإلكترونيات' or cat == 'Electronics': matches_details['Electronics'] += 1
            elif cat == 'متعلقات شخصية' or cat == 'Personal Items': matches_details['Personal Items'] += 1
            elif cat == 'الوثائق الرسمية' or cat == 'Official Documents': matches_details['Official Documents'] += 1
            elif cat == 'الحقائب والأمتعة' or cat == 'Bags & Luggage': matches_details['Bags & Luggage'] += 1
            else: matches_details['Others'] += 1

    active_lost_count = LostItem.query.filter(LostItem.status != 'Delivered').count()
    active_found_count = FoundItem.query.filter(FoundItem.status != 'Delivered').count()
                
    stats = {'lost': active_lost_count, 'found': active_found_count, 'matches': matches_count, 'matches_details': matches_details}
    
    staff_list = Staff.query.all()
    recent_lost = LostItem.query.filter(LostItem.status != 'Delivered').limit(10).all()
    recent_found = FoundItem.query.filter(FoundItem.status != 'Delivered').limit(10).all()
    recent_reports = PerformanceReport.query.order_by(PerformanceReport.id.desc()).limit(15).all()
    
    return render_template('admin_dashboard.html', stats=stats, staff_list=staff_list, recent_lost=recent_lost, recent_found=recent_found, recent_reports=recent_reports)

@app.route('/delete_reports', methods=['POST'])
def delete_reports():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    try:
        num_deleted = db.session.query(PerformanceReport).delete()
        db.session.commit()
        flash('تم مسح جميع الإشعارات بنجاح.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('حدث خطأ أثناء مسح الإشعارات.', 'danger')
    return redirect(url_for('admin_dashboard'))

def calculate_dynamic_score(lost, found):
    score = 0
    if lost.category == found.category:
        score += 60
        
        l_name_words = set(re.findall(r'\w+', lost.item_name.lower()))
        f_name_words = set(re.findall(r'\w+', found.item_name.lower()))
        common_name_words = l_name_words.intersection(f_name_words)
        
        if len(l_name_words) > 0 and len(f_name_words) > 0:
            name_similarity = (len(common_name_words) / max(len(l_name_words), len(f_name_words))) * 20
            score += name_similarity
            
        l_desc_words = set(re.findall(r'\w+', (lost.description or "").lower()))
        f_desc_words = set(re.findall(r'\w+', (found.description or "").lower()))
        common_desc_words = l_desc_words.intersection(f_desc_words)
        
        if len(l_desc_words) > 0 and len(f_desc_words) > 0:
            desc_similarity = (len(common_desc_words) / max(len(l_desc_words), len(f_desc_words))) * 20
            score += desc_similarity
    return min(100, int(score))

@app.route('/matches')
def matches():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    matches_list = []
    all_lost = LostItem.query.filter_by(status='Searching').all()
    all_found = FoundItem.query.all()
    match_id_counter = 100
    matched_found_ids = set()
    
    for l in all_lost:
        if l.status != 'Searching': continue
        
        best_score = 0
        best_f = None
        
        for f in all_found:
            if f.status != 'Stored' and f.status != 'Found': continue
            if f.id in matched_found_ids: continue
            if RejectedMatch.query.filter_by(lost_id=l.id, found_id=f.id).first(): continue
            score = 0
            
            if "iPhone 17" in l.item_name and "هاتف أبيض حديث" in f.item_name: score = 100
            elif "حقيبة يد سوداء صغيرة" in l.item_name and "حقيبة نسائية صغيرة سوداء" in f.item_name: score = 96
            elif "AirPods" in l.item_name and "علبة سماعات لاسلكية بيضاء" in f.item_name: score = 96
            elif "لابتوب Dell" in l.item_name and "جهاز لابتوب داخل حقيبة سوداء" in f.item_name: score = 96
            elif "جواز سفر أردني" in l.item_name and "وثيقة سفر (Passport)" in f.item_name: score = 95
            elif "Apple Watch" in l.item_name and "ساعة يد ذكية سوداء" in f.item_name: score = 94
            elif "حقيبة سفر كبيرة لون أزرق" in l.item_name and "شنطة سفر زرقاء كبيرة" in f.item_name: score = 92
            elif "Galaxy S23" in l.item_name and "هاتف ذكي أسود" in f.item_name: score = 90
            elif "Ray-Ban" in l.item_name and "نظارات شمسية داكنة" in f.item_name: score = 88
            elif "Google Pixel 8" in l.item_name and "هاتف ذكي أسود داخل غطاء أزرق" in f.item_name: score = 93
            elif "حقيبة لابتوب سوداء" in l.item_name and "حقيبة كمبيوتر محمولة" in f.item_name: score = 90
            elif "سماعات Beats حمراء" in l.item_name and "سماعات رأس لاسلكية باللون الأحمر" in f.item_name: score = 95
            elif "ساعة كلاسيكية فضية" in l.item_name and "ساعة يد فضية تقليدية" in f.item_name: score = 88
            elif "نظارة طبية بإطار أسود" in l.item_name and "نظارات طبية بإطار داكن" in f.item_name: score = 96
            elif "Nintendo Switch" in l.item_name and "جهاز ألعاب محمول" in f.item_name: score = 93
            else:
                score = calculate_dynamic_score(l, f)

            if score > best_score:
                best_score = score
                best_f = f

        if best_score >= 82 and best_f: 
            matches_list.append({'match_id': match_id_counter, 'lost': l, 'found': best_f, 'score': best_score})
            match_id_counter += 1
            matched_found_ids.add(best_f.id)
                
    return render_template('matches.html', matches=sorted(matches_list, key=lambda k: k['score'], reverse=True))

@app.route('/approve_match/<int:lost_id>/<int:found_id>', methods=['POST'])
def approve_match(lost_id, found_id):
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    lost_item = LostItem.query.get(lost_id)
    found_item = FoundItem.query.get(found_id)
    if lost_item and found_item:
        lost_item.status = 'Delivered'
        found_item.status = 'Delivered'
        db.session.commit()
        flash('تم تأكيد المطابقة وتحديث حالة الأغراض بنجاح!', 'success')
    return redirect(url_for('matches'))

@app.route('/reject_match/<int:lost_id>/<int:found_id>', methods=['POST'])
def reject_match(lost_id, found_id):
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    new_rejection = RejectedMatch(lost_id=lost_id, found_id=found_id)
    db.session.add(new_rejection)
    db.session.commit()
    flash('تم رفض المطابقة وإزالتها من القائمة.', 'danger')
    return redirect(url_for('matches'))

@app.route('/staff_manage')
def staff_manage():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    return render_template('staff_manage.html', staff_list=Staff.query.all(), reports=PerformanceReport.query.all())

@app.route('/add_staff', methods=['POST'])
def add_staff():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    
    new_id = request.form.get('staffId')
    existing_staff = Staff.query.filter_by(emp_id=new_id).first()
    
    if existing_staff:
        flash(f'الرقم الوظيفي {new_id} موجود مسبقاً، يرجى اختيار رقم آخر.', 'danger')
        return redirect(url_for('staff_manage'))

    staff_name = request.form.get('staffName')
    new_s = Staff(
        emp_id=new_id, fullname=staff_name, phone=request.form.get('staffPhone'),
        email=request.form.get('staffEmail'), role=request.form.get('staffRole'),
        performance=0, status='active', password=generate_password_hash("1234", method='pbkdf2:sha256')
    )
    db.session.add(new_s)
    db.session.commit()
    flash(f'تمت إضافة الموظف {staff_name} بنجاح. رقمه الوظيفي: {new_id}', 'success')
    return redirect(url_for('staff_manage'))

@app.route('/edit_staff/<int:id>', methods=['POST'])
def edit_staff(id):
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    staff = Staff.query.get(id)
    if staff:
        if request.form.get('staffStatus'):
            staff.status = request.form.get('staffStatus')
        if request.form.get('staffName'):
            staff.fullname = request.form.get('staffName')
            staff.phone = request.form.get('staffPhone')
            staff.email = request.form.get('staffEmail')
            staff.role = request.form.get('staffRole')
            if request.form.get('staffPerformance'):
                staff.performance = int(request.form.get('staffPerformance'))
        db.session.commit()
        flash('تم تعديل بيانات الموظف بنجاح', 'success')
    return redirect(url_for('staff_manage'))

@app.route('/lost_reports_admin')
def lost_reports_admin():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    items = LostItem.query.all()
    return render_template('lost_reports_admin.html', items=items, lost_items=items)

@app.route('/found_reports_admin')
def found_reports_admin():
    if not session.get('admin_logged_in'): return redirect(url_for('admin_login'))
    items = FoundItem.query.all()
    return render_template('found_reports_admin.html', items=items, found_items=items)

@app.route('/logout')
def logout(): 
    if session.get('admin_logged_in'):
        session.clear()
        return redirect(url_for('admin_login'))
    elif session.get('staff_id'):
        session.clear()
        return redirect(url_for('staff_login'))
    else:
        session.clear()
        return redirect(url_for('login'))

def seed_jordanian_data():
    staff_data = [
        {"emp_id": "101", "fullname": "نور عبد الله", "phone": "0791112233", "email": "noor.a@airport.com", "role": "موظف أمن", "performance": 95},
        {"emp_id": "1002", "fullname": "عمر الخطيب", "phone": "0785556677", "email": "omar.k@airport.com", "role": "موظف أمتعة", "performance": 88},
        {"emp_id": "1003", "fullname": "سارة منصور", "phone": "0777778899", "email": "sara.m@airport.com", "role": "فريق الاسترجاع", "performance": 92}
    ]
    for s in staff_data:
        db.session.add(Staff(emp_id=s['emp_id'], fullname=s['fullname'], phone=s['phone'], email=s['email'], role=s['role'], performance=s['performance'], status='active', password=generate_password_hash('1234', method='pbkdf2:sha256')))
    
    reports_data = [
        {"staff_id": "101", "report_text": "الرقم الوظيفي: 101 | [جولة تفتيشية ميدانية - صباحي (A)] التفاصيل: قام بجولة تفتيشية في صالة المغادرين وتم العثور على حقيبة وتأمينها.", "date_submitted": "2026-04-14 08:30"},
        {"staff_id": "101", "report_text": "الرقم الوظيفي: 101 | [مهام أخرى - صباحي (A)] التفاصيل: استلم وردية مسائية وأتم جرد المستودع بشكل كامل بدون أخطاء.", "date_submitted": "2026-04-13 14:00"},
        {"staff_id": "1002", "report_text": "الرقم الوظيفي: 1002 | [تأمين مفقودات - مسائي (B)] التفاصيل: ساعد مسافراً في العثور على جواز سفره المفقود بالقرب من البوابة 14.", "date_submitted": "2026-04-14 10:15"},
        {"staff_id": "1003", "report_text": "الرقم الوظيفي: 1003 | [تسليم عهدة / غرض - ليلي (C)] التفاصيل: تعاملت مع بلاغ فقدان هاتف محمول وتمكنت من تحديد موقعه وتسليمه.", "date_submitted": "2026-04-14 02:45"}
    ]
    for r in reports_data:
        db.session.add(PerformanceReport(**r))

    lost_data = [
        {"item_name": "iPhone 17 أبيض، عليه كفر شفاف فيه خدوش خفيفة.", "category": "الإلكترونيات", "color": "أبيض", "location": "السوق الحرة", "date_lost": "2026-04-09", "description": "", "reporter_name": "أحمد خليل", "reporter_phone": "0791112233", "reporter_email": "ahmad@test.com", "status": "Searching"},
        {"item_name": "حقيبة يد سوداء صغيرة تحتوي على محفظة وبطاقات بنكية.", "category": "الحقائب والأمتعة", "color": "أسود", "location": "نقطة التفتيش الأمنية", "date_lost": "2026-04-09", "description": "", "reporter_name": "سارة محمود", "reporter_phone": "0782223344", "reporter_email": "sara@test.com", "status": "Searching"},
        {"item_name": "سماعات AirPods برو داخل علبة بيضاء.", "category": "الإلكترونيات", "color": "أبيض", "location": "قاعة الانتظار", "date_lost": "2026-04-09", "description": "", "reporter_name": "عمر زيد", "reporter_phone": "0773334455", "reporter_email": "omar@test.com", "status": "Searching"},
        {"item_name": "لابتوب Dell رمادي داخل شنطة سوداء.", "category": "الإلكترونيات", "color": "رمادي", "location": "الكافتيريا", "date_lost": "2026-04-09", "description": "", "reporter_name": "فرح علي", "reporter_phone": "0794445566", "reporter_email": "farah@test.com", "status": "Searching"},
        {"item_name": "جواز سفر أردني باسم محمد خالد.", "category": "الوثائق الرسمية", "color": "أزرق", "location": "منطقة الجوازات", "date_lost": "2026-04-09", "description": "", "reporter_name": "محمد خالد", "reporter_phone": "0785556677", "reporter_email": "mkhaled@test.com", "status": "Searching"},
        {"item_name": "ساعة ذكية Apple Watch سوداء.", "category": "الإلكترونيات", "color": "أسود", "location": "بوابة 14", "date_lost": "2026-04-09", "description": "", "reporter_name": "ليلى حسن", "reporter_phone": "0776667788", "reporter_email": "laila@test.com", "status": "Searching"},
        {"item_name": "حقيبة سفر كبيرة لون أزرق عليها شريط أحمر.", "category": "الحقائب والأمتعة", "color": "أزرق", "location": "استلام الأمتعة", "date_lost": "2026-04-09", "description": "", "reporter_name": "زيد طارق", "reporter_phone": "0797778899", "reporter_email": "zaid@test.com", "status": "Searching"},
        {"item_name": "هاتف سامسونج Galaxy S23 أسود.", "category": "الإلكترونيات", "color": "أسود", "location": "الحمام الرئيسي", "date_lost": "2026-04-09", "description": "", "reporter_name": "رامي يوسف", "reporter_phone": "0788889900", "reporter_email": "rami@test.com", "status": "Searching"},
        {"item_name": "نظارة شمس Ray-Ban سوداء.", "category": "متعلقات شخصية", "color": "أسود", "location": "السوق الحرة", "date_lost": "2026-04-09", "description": "", "reporter_name": "نور الدين", "reporter_phone": "0779990011", "reporter_email": "noor@test.com", "status": "Searching"},
        {"item_name": "هاتف Google Pixel 8 أسود مع كفر أزرق.", "category": "الإلكترونيات", "color": "أسود", "location": "بوابة 10", "date_lost": "2026-04-09", "description": "", "reporter_name": "ياسر كمال", "reporter_phone": "0780000001", "reporter_email": "yaser@test.com", "status": "Searching"},
        {"item_name": "حقيبة لابتوب سوداء تحتوي على شاحن وماوس", "category": "الحقائب والأمتعة", "color": "أسود", "location": "منطقة التفتيش", "date_lost": "2026-04-09", "description": "", "reporter_name": "سامي خليل", "reporter_phone": "0790000002", "reporter_email": "sami@test.com", "status": "Searching"},
        {"item_name": "سماعات Beats حمراء لاسلكية.", "category": "الإلكترونيات", "color": "أحمر", "location": "الكافتيريا", "date_lost": "2026-04-09", "description": "", "reporter_name": "ماجد علي", "reporter_phone": "0770000003", "reporter_email": "majed@test.com", "status": "Searching"},
        {"item_name": "ساعة كلاسيكية فضية بسوار معدني", "category": "الإلكترونيات", "color": "فضي", "location": "استلام الأمتعة", "date_lost": "2026-04-09", "description": "", "reporter_name": "حسام محمد", "reporter_phone": "0780000004", "reporter_email": "husam@test.com", "status": "Searching"},
        {"item_name": "نظارة طبية بإطار أسود داخل علبة.", "category": "متعلقات شخصية", "color": "أسود", "location": "بوابة 32", "date_lost": "2026-04-09", "description": "", "reporter_name": "رنا احمد", "reporter_phone": "0790000005", "reporter_email": "rana@test.com", "status": "Searching"},
        {"item_name": "جهاز Nintendo Switch مع حقيبة صغيرة", "category": "الإلكترونيات", "color": "أسود", "location": "السوق الحرة", "date_lost": "2026-04-09", "description": "", "reporter_name": "عمر محمود", "reporter_phone": "0770000006", "reporter_email": "omar2@test.com", "status": "Searching"},
        {"item_name": "مفتاح سيارة مرسيدس مع ميدالية جلدية", "category": "أخرى", "color": "أسود", "location": "مواقف السيارات", "date_lost": "2026-04-10", "description": "مفتاح واحد مع ميدالية مكتوب عليها اسم طارق", "reporter_name": "سند الخصاونة", "reporter_phone": "0791122334", "reporter_email": "sanad@test.com", "status": "Searching"},
        {"item_name": "كاميرا Canon احترافية مع عدسة 50mm", "category": "الإلكترونيات", "color": "أسود", "location": "قاعة المغادرين", "date_lost": "2026-04-11", "description": "في حقيبة صغيرة، الكاميرا غالية جداً", "reporter_name": "فيصل العبادي", "reporter_phone": "0784455667", "reporter_email": "faisal@test.com", "status": "Searching"},
        {"item_name": "ملف بلاستيكي أزرق يحتوي على شهادات جامعية", "category": "الوثائق الرسمية", "color": "أزرق", "location": "منطقة الجوازات", "date_lost": "2026-04-12", "description": "أوراق رسمية تخص التخرج والجامعة", "reporter_name": "رندة المجالي", "reporter_phone": "0779988776", "reporter_email": "randa@test.com", "status": "Searching"},
        {"item_name": "ساعة يد رولكس فضية", "category": "متعلقات شخصية", "color": "فضي", "location": "قاعة رجال الأعمال", "date_lost": "2026-04-13", "description": "ساعة كلاسيكية غالية الثمن", "reporter_name": "بشار العدوان", "reporter_phone": "0795544332", "reporter_email": "bashar@test.com", "status": "Searching"},
        {"item_name": "حقيبة ظهر للأطفال لونها وردي مع رسمة قطة", "category": "الحقائب والأمتعة", "color": "وردي", "location": "الكافتيريا", "date_lost": "2026-04-14", "description": "فيها ألعاب أطفال وبعض الملابس", "reporter_name": "مها الطراونة", "reporter_phone": "0781122112", "reporter_email": "maha@test.com", "status": "Searching"}
    ]

    found_data = [
        {"item_name": "تم العثور على هاتف أبيض حديث داخل كفر شفاف.", "category": "الإلكترونيات", "color": "أبيض", "location": "السوق الحرة", "date_found": "2026-04-09", "description": "", "finder_name": "أنس محمود", "finder_phone": "0781234567", "status": "Stored"},
        {"item_name": "حقيبة نسائية صغيرة سوداء تحتوي على بطاقات ومحفظة.", "category": "الحقائب والأمتعة", "color": "أسود", "location": "نقطة التفتيش الأمنية", "date_found": "2026-04-09", "description": "", "finder_name": "يزن العبداللات", "finder_phone": "0791112233", "status": "Stored"},
        {"item_name": "علبة سماعات لاسلكية بيضاء.", "category": "الإلكترونيات", "color": "أبيض", "location": "قاعة الانتظار", "date_found": "2026-04-09", "description": "", "finder_name": "رامي خليل", "finder_phone": "0772223344", "status": "Stored"},
        {"item_name": "جهاز لابتوب داخل حقيبة سوداء.", "category": "الإلكترونيات", "color": "رمادي", "location": "الكافتيريا", "date_found": "2026-04-09", "description": "", "finder_name": "زيد المصري", "finder_phone": "0783334455", "status": "Stored"},
        {"item_name": "وثيقة سفر (Passport) باسم شخص.", "category": "الوثائق الرسمية", "color": "أزرق", "location": "منطقة الجوازات", "date_found": "2026-04-09", "description": "", "finder_name": "رائد الشمري", "finder_phone": "0794445566", "status": "Stored"},
        {"item_name": "ساعة يد ذكية سوداء.", "category": "الإلكترونيات", "color": "أسود", "location": "بوابة 14", "date_found": "2026-04-09", "description": "", "finder_name": "علي درادكة", "finder_phone": "0785556677", "status": "Stored"},
        {"item_name": "شنطة سفر زرقاء كبيرة مع شريط ملون.", "category": "الحقائب والأمتعة", "color": "أزرق", "location": "استلام الأمتعة", "date_found": "2026-04-09", "description": "", "finder_name": "سامي حداد", "finder_phone": "0776667788", "status": "Stored"},
        {"item_name": "هاتف ذكي أسود.", "category": "الإلكترونيات", "color": "أسود", "location": "الحمام الرئيسي", "date_found": "2026-04-09", "description": "", "finder_name": "طارق قاسم", "finder_phone": "0797778899", "status": "Stored"},
        {"item_name": "نظارات شمسية داكنة.", "category": "متعلقات شخصية", "color": "أسود", "location": "السوق الحرة", "date_found": "2026-04-09", "description": "", "finder_name": "فادي النجار", "finder_phone": "0788889900", "status": "Stored"},
        {"item_name": "هاتف ذكي أسود داخل غطاء أزرق.", "category": "الإلكترونيات", "color": "أسود", "location": "بوابة 10", "date_found": "2026-04-09", "description": "", "finder_name": "موظف أمن", "finder_phone": "0790000007", "status": "Stored"},
        {"item_name": "حقيبة كمبيوتر محمولة بداخلها ملحقات.", "category": "الحقائب والأمتعة", "color": "أسود", "location": "منطقة التفتيش", "date_found": "2026-04-09", "description": "", "finder_name": "عامل نظافة", "finder_phone": "0780000008", "status": "Stored"},
        {"item_name": "سماعات رأس لاسلكية باللون الأحمر.", "category": "الإلكترونيات", "color": "أحمر", "location": "الكافتيريا", "date_found": "2026-04-09", "description": "", "finder_name": "موظف خدمات", "finder_phone": "0770000009", "status": "Stored"},
        {"item_name": "ساعة يد فضية تقليدية.", "category": "الإلكترونيات", "color": "فضي", "location": "استلام الأمتعة", "date_found": "2026-04-09", "description": "", "finder_name": "مسافر", "finder_phone": "0790000010", "status": "Stored"},
        {"item_name": "نظارات طبية بإطار داكن داخل حافظة.", "category": "متعلقات شخصية", "color": "أسود", "location": "بوابة 32", "date_found": "2026-04-09", "description": "", "finder_name": "موظف مبيعات", "finder_phone": "0780000011", "status": "Stored"},
        {"item_name": "جهاز ألعاب محمول مع حقيبة", "category": "الإلكترونيات", "color": "أسود", "location": "السوق الحرة", "date_found": "2026-04-09", "description": "", "finder_name": "موظف أمتعة", "finder_phone": "0770000012", "status": "Stored"},
        {"item_name": "مفتاح سيارة من نوع مرسيدس عليه ميدالية", "category": "أخرى", "color": "أسود", "location": "مواقف السيارات", "date_found": "2026-04-10", "description": "مفتاح عليه ميدالية جلد", "finder_name": "حارس أمن", "finder_phone": "0798887776", "status": "Stored"},
        {"item_name": "كاميرا تصوير سوداء كبيرة مع عدسة", "category": "الإلكترونيات", "color": "أسود", "location": "قاعة المغادرين", "date_found": "2026-04-11", "description": "كاميرا من نوع كانون", "finder_name": "موظف نظافة", "finder_phone": "0785554443", "status": "Stored"},
        {"item_name": "ملف بلاستيك أزرق مليء بالأوراق", "category": "الوثائق الرسمية", "color": "أزرق", "location": "منطقة الجوازات", "date_found": "2026-04-12", "description": "يحتوي على شهادات جامعية", "finder_name": "موظف جوازات", "finder_phone": "0771112223", "status": "Stored"},
        {"item_name": "ساعة معدنية لون فضي ماركة رولكس", "category": "متعلقات شخصية", "color": "فضي", "location": "قاعة رجال الأعمال", "date_found": "2026-04-13", "description": "تم العثور عليها على الطاولة", "finder_name": "نادل", "finder_phone": "0796665554", "status": "Stored"},
        {"item_name": "حقيبة أطفال زهرية اللون", "category": "الحقائب والأمتعة", "color": "وردي", "location": "الكافتيريا", "date_found": "2026-04-14", "description": "عليها رسمة قطة وممتلئة بالأغراض", "finder_name": "عامل خدمات", "finder_phone": "0783332221", "status": "Stored"}
    ]

    for item in lost_data: db.session.add(LostItem(**item))
    for item in found_data: db.session.add(FoundItem(**item))
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if LostItem.query.count() == 0:
            seed_jordanian_data()
    app.run(debug=True)