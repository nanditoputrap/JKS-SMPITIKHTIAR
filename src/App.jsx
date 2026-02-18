import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Save, 
  LogOut, 
  CheckSquare, 
  Printer, 
  BarChart2, 
  List, 
  ArrowLeft, 
  Eye, 
  Lock, 
  Database, 
  Check, 
  FileDown, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  School,
  Moon,
  Sun,
  Heart,
  Percent,
  FileText,
  Edit3,
  AlertTriangle,
  Award,
  Users,          
  ClipboardList,
  Settings,
  Table,
  Ban 
} from 'lucide-react';

const loadChartJs = () => {
  return new Promise((resolve) => {
    if (window.Chart) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
};

const App = () => {
  // --- STATE MANAGEMENT ---
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('siswa');
  const [animate, setAnimate] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [tempTeacherName, setTempTeacherName] = useState('');
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [showDisciplinePrint, setShowDisciplinePrint] = useState(false);
  const [viewingClass, setViewingClass] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingTeacher, setPendingTeacher] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // --- DATA AWAL ---
  const initialTeachers = [
    { id: 1, name: 'Siti Naswiyah Saleh, S.Pd', class: '7A', niy: '' },
    { id: 2, name: 'Sulaiman, S.Ag', class: '7B', niy: '' },
    { id: 3, name: 'Miftah Hul Jannah, S.Pd., Gr', class: '8A', niy: '' },
    { id: 4, name: 'Ahmad Risal, S.Pd., Gr', class: '8B', niy: '' },
    { id: 5, name: 'Muhammad Fadli Pasalo, S.Pd', class: '9A', niy: '' },
    { id: 6, name: 'Rijal, S.Pd', class: '9B', niy: '' },
    { id: 7, name: 'Muh. Ikhsan, S.H', class: '7C', niy: '' },
    { id: 8, name: 'Aminah, S.Pd., Gr', class: '8C', niy: '' },
    { id: 9, name: 'Musdalifah, S.Si', class: '9C', niy: '' },
    { id: 10, name: 'Wahid Zakiyh, S.Pd', class: '7D', niy: '' },
    { id: 11, name: 'Muh, Arfah. S.Pd.I', class: '8D', niy: '' },
    { id: 99, name: 'Amirah Risnawati, S.H., Gr', class: 'KESISWAAN', niy: '' },
  ];

  const rawInitialStudents = [
    { name: "AHMAD FATIH KHAIRAN", class: "7A", gender: "L" },
    { name: "ANDI INDIRA KASIH", class: "7A", gender: "P" },
    { name: "AYNAL MARDIYAH MUIZ", class: "7A", gender: "P" },
    { name: "NUR FABIAN TEYZAR RAHMAN", class: "7A", gender: "L" },
    { name: "HAFIDZ MUHAMMAD MAWARDI", class: "7A", gender: "L" },
    { name: "INDIRA DWI SYAFIKA", class: "7A", gender: "P" },
    { name: "MIKAYLA IWANA LUBNA", class: "7A", gender: "P" },
    { name: "MUH. AZZAM A", class: "7A", gender: "L" },
    { name: "MUHAMMAD NAUFAL", class: "7A", gender: "L" },
    { name: "REZKYANI AZ-ZAHRA NAILA PUTRI", class: "7A", gender: "P" },
    { name: "SABILAH PUTRA RAMADHAN", class: "7A", gender: "L" },
    { name: "SYALENDRA AL-GHIFARI RAMADAN", class: "7A", gender: "L" },
    { name: "ABDILLAH RAYYAN FARSHAD", class: "7B", gender: "L" },
    { name: "AHMAD MULTAZAM", class: "7B", gender: "L" },
    { name: "AQILA ALFISA ANSAR", class: "7B", gender: "P" },
    { name: "HAURA NASHIFA", class: "7B", gender: "P" },
    { name: "KHEISYA MIRANTI", class: "7B", gender: "P" },
    { name: "MUH AKHTAR AMANULLAH", class: "7B", gender: "L" },
    { name: "MUH. ARFAH RISKI SAPUTRA", class: "7B", gender: "L" },
    { name: "MUHAMMAD FADHIL", class: "7B", gender: "L" },
    { name: "NUR MALAYKA RISKYA", class: "7B", gender: "P" },
    { name: "RAJA ABID ABHINAYA", class: "7B", gender: "L" },
    { name: "SHAFIQA NURUL DZAKIRAH", class: "7B", gender: "P" },
  ];

  const generateId = () => Date.now() + Math.random();

  // --- STATE DATABASE (LOCALSTORAGE) ---
  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem('jks_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [schoolConfig, setSchoolConfig] = useState(() => {
    const saved = localStorage.getItem('jks_schoolConfig');
    return saved ? JSON.parse(saved) : {
      headmaster: { name: 'Masita Dasa, S.Sos., M.Pd.I., Gr', niy: '' },
      kesiswaan: { name: 'Amirah Risnawati, S.H., Gr', niy: '' },
      address: 'JL. SUNU KOMPLEKS UNHAS BARAYA, MAKASSAR, SULAWESI SELATAN'
    };
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('jks_students');
    if (saved) return JSON.parse(saved);
    return rawInitialStudents.map(s => ({ ...s, id: generateId(), nisn: '' }));
  });

  const [violations, setViolations] = useState(() => {
    const saved = localStorage.getItem('jks_violations');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyChecklist, setDailyChecklist] = useState(() => {
    const saved = localStorage.getItem('jks_dailyChecklist');
    return saved ? JSON.parse(saved) : {};
  });

  // Default bulan ke bulan saat ini
  const [reportMonth, setReportMonth] = useState(() => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months[new Date().getMonth()];
  });

  useEffect(() => { localStorage.setItem('jks_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('jks_schoolConfig', JSON.stringify(schoolConfig)); }, [schoolConfig]);
  useEffect(() => { localStorage.setItem('jks_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('jks_violations', JSON.stringify(violations)); }, [violations]);
  useEffect(() => { localStorage.setItem('jks_dailyChecklist', JSON.stringify(dailyChecklist)); }, [dailyChecklist]);

  const [studentForm, setStudentForm] = useState({ name: '', class: '7A', nisn: '', gender: 'L' });
  const [disciplineDate, setDisciplineDate] = useState(new Date().toISOString().split('T')[0]);
  const [disciplineClass, setDisciplineClass] = useState('7A');

  useEffect(() => { setAnimate(true); }, []);

  const isKesiswaan = selectedTeacher?.class === 'KESISWAAN';

  // --- LOGIC KELAS AKTIF ---
  useEffect(() => {
    if (selectedTeacher) {
      if (selectedTeacher.class === 'KESISWAAN') {
        const availableClasses = teachers.filter(t => t.class !== 'KESISWAAN').map(t => t.class);
        const defaultClass = availableClasses.length > 0 ? availableClasses[0] : '';
        setViewingClass(defaultClass);
        setActiveTab('pantau_harian'); 
      } else {
        setViewingClass(selectedTeacher.class);
        setActiveTab('siswa');
      }
    }
  }, [selectedTeacher, teachers]); 

  useEffect(() => {
    setStudentForm(prev => ({ ...prev, class: viewingClass }));
    setDisciplineClass(viewingClass); 
  }, [viewingClass]);

  // Efek Chart untuk kedua tab laporan
  useEffect(() => {
    if ((activeTab === 'laporan' || activeTab === 'rekap_disiplin') && students.length > 0) {
      loadChartJs().then(() => {
        setTimeout(activeTab === 'rekap_disiplin' ? renderDisciplineChart : renderReportChart, 200);
      });
    }
  }, [activeTab, violations, reportMonth, viewingClass]);

  // --- INDIKATOR KEDISIPLINAN ---
  const disciplineIndicators = [
    { label: "Datang Tepat Waktu", points: 5 },
    { label: "Seragam Rapi Sesuai Jadwal", points: 5 },
    { label: "Jilbab Syar'i (Akhwat)", points: 3 },
    { label: "Menggunakan Sepatu", points: 2 },
    { label: "Ciput (Pr) / Rambut Rapi (Lk)", points: 2 },
    { label: "Leging (Akhwat)", points: 2 },
    { label: "Kaos Kaki Panjang (Akhwat)", points: 2 },
    { label: "Kebersihan & Kerapihan Kelas", points: 3 },
    { label: "Tidak Bawa HP/Laptop", points: 10 },
    { label: "Tidak Make Up (Akhwat)", points: 3 },
    { label: "Sopan dan Santun", points: 5 },
    { label: "Tertib Pembelajaran", points: 2 },
    { label: "Sholat Tertib", points: 5 }
  ];

  const isAkhwatIndicator = (label) => label.includes("(Akhwat)");

  // Helper Total Poin Harian (Maksimal)
  const getMaxDailyPoints = (gender) => {
    return gender === 'P' ? 49 : 39;
  };

  const getDaysInMonth = (monthName) => {
    const days = {
      'Januari': 31, 'Februari': 29, 'Maret': 31, 'April': 30, 'Mei': 31, 'Juni': 30,
      'Juli': 31, 'Agustus': 31, 'September': 30, 'Oktober': 31, 'November': 30, 'Desember': 31
    };
    return days[monthName] || 30;
  };

  // Helper untuk mendapatkan nama bulan dari string YYYY-MM-DD
  const getMonthNameFromDateString = (dateStr) => {
     const monthIndex = parseInt(dateStr.split('-')[1], 10) - 1;
     const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
     return months[monthIndex];
  };

  // --- HANDLERS UTAMA ---
  const handleLogin = (teacher) => {
    if (teacher.class === 'KESISWAAN') {
      setPendingTeacher(teacher);
      setShowPasswordModal(true);
    } else {
      setSelectedTeacher(teacher);
    }
  };

  const verifyPassword = (e) => {
    e.preventDefault();
    if (passwordInput === '1212') {
      setSelectedTeacher(pendingTeacher);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPendingTeacher(null);
    } else {
      alert("Password Salah!");
    }
  };

  const handleLogout = () => { setSelectedTeacher(null); };

  const handleSchoolConfigChange = (section, field, value) => {
    setSchoolConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleTeacherDataUpdate = (id, field, value) => {
    if (field === 'class') {
      const oldClass = teachers.find(t => t.id === id)?.class;
      if (oldClass && oldClass !== value) {
        setStudents(prev => prev.map(s => s.class === oldClass ? { ...s, class: value } : s));
      }
    }
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = { id: generateId(), ...studentForm };
    setStudents([...students, newStudent]);
    setStudentForm({ ...studentForm, name: '', nisn: '', gender: 'L' });
    triggerToast('Siswa berhasil ditambahkan!');
  };

  const handleBatchAddStudent = (e) => {
    e.preventDefault();
    if (!batchInput.trim()) return;
    const names = batchInput.split('\n').filter(n => n.trim() !== '');
    const newStudents = names.map(name => ({
      id: generateId() + Math.random(),
      name: name.trim(),
      class: viewingClass,
      nisn: '',
      gender: 'L'
    }));
    setStudents(prev => [...prev, ...newStudents]);
    setBatchInput('');
    triggerToast(`Berhasil menambahkan ${newStudents.length} siswa ke kelas ${viewingClass}.`);
  };

  const handleDeleteStudent = (id) => {
    if(window.confirm('Hapus siswa ini?')) setStudents(students.filter(s => s.id !== id));
  };

  const handleNisnChange = (id, newNisn) => {
    setStudents(students.map(s => s.id === id ? { ...s, nisn: newNisn } : s));
  };

  const handleGenderChange = (id, newGender) => {
    setStudents(students.map(s => s.id === id ? { ...s, gender: newGender } : s));
  };

  const handleStudentNameChange = (id, newName) => {
    setStudents(students.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const getFilteredStudents = () => students.filter(s => s.class === viewingClass);
  const getTeacherForClass = (cls) => teachers.find(t => t.class === cls && t.class !== 'KESISWAAN');
  const getWaliKelasName = (cls) => getTeacherForClass(cls)?.name || '.........................';

  // --- LOGIC INTEGRASI JURNAL HARIAN ---
  useEffect(() => {
    const currentClass = selectedTeacher?.class === 'KESISWAAN' ? viewingClass : (selectedTeacher?.class || disciplineClass);
    
    // Load data tersimpan untuk tanggal yang dipilih
    const savedRecords = violations.filter(v => {
       if (v.date !== disciplineDate) return false;
       const student = students.find(s => s.id === v.studentId);
       return student && student.class === currentClass;
    });

    const newChecklistState = {};

    savedRecords.forEach(v => {
      const indicatorsMap = {};
      if (v.items) {
         v.items.forEach(item => {
            const idx = disciplineIndicators.findIndex(ind => ind.label === item.name);
            if (idx !== -1) indicatorsMap[idx] = true;
         });
      }
      newChecklistState[v.studentId] = { indicators: indicatorsMap, notes: v.notes || '' };
    });

    setDailyChecklist(newChecklistState);

  }, [disciplineDate, viewingClass, selectedTeacher, violations, students]);

  const toggleDisciplineStatus = (studentId, indicatorIndex) => {
    if (isKesiswaan) return; 
    setDailyChecklist(prev => {
      const studentData = prev[studentId] || { indicators: {}, notes: '' };
      const currentIndicators = studentData.indicators || {};
      const currentStatus = currentIndicators[indicatorIndex] === true; 
      return { ...prev, [studentId]: { ...studentData, indicators: { ...currentIndicators, [indicatorIndex]: !currentStatus } } };
    });
  };

  const handleDisciplineNoteChange = (studentId, note) => {
    if (isKesiswaan) return;
    setDailyChecklist(prev => {
      const studentData = prev[studentId] || { indicators: {} };
      return { ...prev, [studentId]: { ...studentData, notes: note } };
    });
  };

  const saveDisciplineTable = () => {
    const studentsInClass = getFilteredStudents();
    let newEntries = [];
    
    studentsInClass.forEach(student => {
      const checkData = dailyChecklist[student.id];
      if (checkData) { 
        const studentAchievements = [];
        let totalPoints = 0;
        
        if (checkData.indicators) {
            disciplineIndicators.forEach((ind, index) => {
            if (checkData.indicators[index] === true) {
                studentAchievements.push({ name: `${ind.label}`, points: ind.points });
                totalPoints += ind.points;
            }
            });
        }
        
        if (studentAchievements.length > 0 || checkData.notes) {
          newEntries.push({
            id: generateId(),
            studentId: student.id,
            date: disciplineDate,
            items: studentAchievements,
            totalPoints: totalPoints,
            notes: checkData.notes || '',
            teacher: selectedTeacher.name
          });
        }
      }
    });

    const filteredViolations = violations.filter(v => 
        !(v.date === disciplineDate && studentsInClass.some(s => s.id === v.studentId))
    );
      
    setViolations([...filteredViolations, ...newEntries]);
    triggerToast(`Jurnal ${viewingClass} tanggal ${disciplineDate} berhasil disimpan.`);
  };

  // --- LOGIC REKAP BULANAN ---
  const getMonthlyStats = (studentId, monthName) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { totalPoints: 0, percentage: 0 };

    const records = violations.filter(v => {
      if (v.studentId !== studentId) return false;
      const d = new Date(v.date);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return months[d.getMonth()] === monthName;
    });

    let totalPoints = 0;
    records.forEach(r => totalPoints += (r.totalPoints || 0));

    // PERBAIKAN: Gunakan jumlah hari dalam bulan sebagai pembagi (Total Hari Kalender)
    const daysInMonth = getDaysInMonth(monthName);
    
    const maxDailyPoints = getMaxDailyPoints(student.gender);
    const maxPossible = daysInMonth * maxDailyPoints; 
    
    const percentage = maxPossible > 0 ? Math.round((totalPoints / maxPossible) * 100) : 0;

    return { totalPoints, percentage };
  };

  const getMonthlyItemCounts = (studentId, monthName) => {
    const records = violations.filter(v => {
      if (v.studentId !== studentId) return false;
      const d = new Date(v.date);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return months[d.getMonth()] === monthName;
    });

    const itemCounts = {};
    disciplineIndicators.forEach(ind => itemCounts[ind.label] = 0);

    records.forEach(r => {
      if(r.items) {
        r.items.forEach(item => {
           if(itemCounts[item.name] !== undefined) {
             itemCounts[item.name]++;
           }
        });
      }
    });

    return itemCounts;
  };

  const getMonthlyClassItemStats = (monthName) => {
    const studentsInClass = getFilteredStudents();
    const itemStats = {};
    disciplineIndicators.forEach(ind => itemStats[ind.label] = 0);
    studentsInClass.forEach(s => {
       const counts = getMonthlyItemCounts(s.id, monthName);
       Object.keys(counts).forEach(key => itemStats[key] += counts[key]);
    });
    return itemStats;
  };

  // --- HELPER LAIN ---
  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 500);
  };

  const handleResetData = () => {
    if (confirm("PERINGATAN: Ini akan menghapus SEMUA data yang tersimpan di browser ini. Apakah Anda yakin?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const GenericDateNavigator = ({ date, setDate }) => {
    const changeDate = (days) => {
      const currentDate = new Date(date);
      currentDate.setDate(currentDate.getDate() + days);
      setDate(currentDate.toISOString().split('T')[0]);
    };
    return (
      <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-sm">
        <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500"><ChevronLeft className="w-5 h-5" /></button>
        <div className="relative group mx-1">
          <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md group-hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500"><ChevronRight className="w-5 h-5" /></button>
      </div>
    );
  };

  const renderReportChart = () => {
    if (!chartRef.current) return;
    if (chartInstance) chartInstance.destroy();

    const studentsInClass = getFilteredStudents();
    const studentLabels = studentsInClass.map(s => s.name);
    const dataValues = studentsInClass.map(s => getMonthlyStats(s.id, reportMonth).percentage);

    const ctx = chartRef.current.getContext('2d');
    const newChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: studentLabels,
        datasets: [{
          label: 'Persentase Kepatuhan (%)',
          data: dataValues,
          backgroundColor: 'rgba(16, 185, 129, 0.7)', 
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: { y: { beginAtZero: true, max: 100 } },
        plugins: { legend: { display: false } }
      }
    });
    setChartInstance(newChart);
  };

  const renderDisciplineChart = () => {
    if (!chartRef.current) return;
    if (chartInstance) chartInstance.destroy();
    const itemStats = getMonthlyClassItemStats(reportMonth);
    const labels = Object.keys(itemStats);
    const data = Object.values(itemStats);
    const ctx = chartRef.current.getContext('2d');
    const newChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Kepatuhan Kelas (Hari)',
          data: data,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    });
    setChartInstance(newChart);
  };

  const getSavedStatus = (studentId, date, indicatorLabel) => {
    const record = violations.find(v => v.studentId === studentId && v.date === date);
    if (record) {
      return record.items.some(item => item.name === indicatorLabel);
    }
    return false;
  };

  const getSavedNote = (studentId, date) => {
    const record = violations.find(v => v.studentId === studentId && v.date === date);
    return record ? record.notes : '-';
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none print:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[100px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="fixed top-8 right-8 z-[100] animate-slide-in-right print:hidden">
          <div className="bg-white border-l-4 border-emerald-500 shadow-2xl rounded-lg px-6 py-4 flex items-center gap-3">
             <div className="bg-emerald-100 p-2 rounded-full"><Check className="w-5 h-5 text-emerald-600" /></div>
             <div><h4 className="font-bold text-slate-800 text-sm">Sukses</h4><p className="text-slate-500 text-xs">{toastMessage}</p></div>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <div className="flex justify-center mb-4 text-indigo-600"><Lock className="w-12 h-12" /></div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Akses Terbatas</h3>
            <p className="text-center text-slate-500 text-sm mb-6">Masukkan PIN keamanan untuk akun Kesiswaan.</p>
            <form onSubmit={verifyPassword} className="space-y-4">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none text-center text-lg font-bold tracking-widest" placeholder="PIN" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }} className="w-full py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100">Batal</button>
                <button type="submit" className="w-full py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg">Masuk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN SCREEN */}
      {!selectedTeacher ? (
        <div className={`container mx-auto max-w-6xl px-4 py-12 transition-all duration-700 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center justify-center p-4 bg-white shadow-lg rounded-2xl mb-6"><School className="w-10 h-10 text-blue-600" /></div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">JKS <span className="text-blue-600">System</span></h1>
            <p className="text-lg text-slate-500 font-medium">Sistem Jurnal Kedisiplinan & Mutaba'ah <br/> SMPIT Ikhtiar UNHAS</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {teachers.map((teacher, index) => (
              <button key={teacher.id} onClick={() => handleLogin(teacher)} className={`group relative border p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center gap-3 overflow-hidden ${teacher.class === 'KESISWAAN' ? 'bg-indigo-600 border-indigo-700 hover:bg-indigo-700' : 'bg-white hover:bg-blue-50 border-slate-100 hover:border-blue-200'}`}>
                {teacher.class !== 'KESISWAAN' && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner transition-colors ${teacher.class === 'KESISWAAN' ? 'bg-white/20 text-white' : 'bg-slate-100 group-hover:bg-white group-hover:text-blue-600 text-slate-500'}`}>
                  {teacher.class === 'KESISWAAN' ? <Eye className="w-7 h-7" /> : <User className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className={`font-bold transition-colors line-clamp-2 min-h-[40px] flex items-center justify-center text-sm ${teacher.class === 'KESISWAAN' ? 'text-white' : 'text-slate-800 group-hover:text-blue-700'}`}>{teacher.name}</h3>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${teacher.class === 'KESISWAAN' ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-700'}`}>{teacher.class === 'KESISWAAN' ? 'SUPER USER' : `Kelas ${teacher.class}`}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center text-xs text-slate-400">
             <p className="mb-2">Data Anda tersimpan secara otomatis di perangkat ini.</p>
             <button onClick={() => { if(confirm("Hapus semua data?")) { localStorage.clear(); window.location.reload(); } }} className="text-red-300 hover:text-red-500 flex items-center gap-1 mx-auto"><Trash2 className="w-3 h-3"/> Reset Data Lokal</button>
          </div>
        </div>
      ) : (
        
        /* --- MAIN DASHBOARD --- */
        <div className={`container mx-auto max-w-[98%] p-2 md:p-4 transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0'}`}>
          
          <header className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl px-6 py-5 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isKesiswaan ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200'}`}>
                {isKesiswaan ? <Eye className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-sm md:text-xl">Jurnal & Mutaba'ah</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                  {!isEditingTeacher ? (
                    <>
                      <p className="text-xs md:text-sm text-slate-500 font-medium flex items-center gap-1">
                        Login: <span className={`${isKesiswaan ? 'text-indigo-600' : 'text-blue-600'} font-bold`}>{selectedTeacher.name}</span> 
                        <span className={`${isKesiswaan ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'} px-2 py-0.5 rounded text-xs font-bold ml-1`}>
                          {isKesiswaan ? 'KESISWAAN' : `Kelas ${selectedTeacher.class}`}
                        </span>
                      </p>
                      {/* Guru biasa hanya bisa edit Nama, BUKAN Kelas */}
                      {!isKesiswaan && (
                        <button onClick={() => { 
                            setIsEditingTeacher(true); 
                            setTempTeacherName(selectedTeacher.name);
                          }} className="text-slate-400 hover:text-blue-500"><Edit3 className="w-3 h-3"/></button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="text" value={tempTeacherName} onChange={(e) => setTempTeacherName(e.target.value)} className="text-sm border border-blue-300 rounded px-2 py-1 outline-none w-32" placeholder="Nama Guru" />
                      <button onClick={updateTeacherInfo} className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded">Simpan</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isKesiswaan && (
              <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 shadow-sm animate-pulse-slow">
                <span className="text-xs font-bold text-indigo-700 uppercase mr-2">PANTAU KELAS:</span>
                <select value={viewingClass} onChange={(e) => setViewingClass(e.target.value)} className="bg-white border border-indigo-300 text-indigo-700 text-sm font-bold rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-indigo-500 transition-colors">
                  {teachers.filter(t => t.class !== 'KESISWAAN').map(t => t.class).sort().map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
               <div className="hidden md:flex items-center text-xs text-slate-400 gap-1 bg-slate-100 px-3 py-1 rounded-full"><Database className="w-3 h-3 text-emerald-500" /> Saved</div>
               <button onClick={() => setSelectedTeacher(null)} className="px-5 py-2 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm"><LogOut className="w-4 h-4" /> Keluar</button>
            </div>
          </header>

          <div className="flex overflow-x-auto pb-4 gap-2 mb-2 scrollbar-hide print:hidden">
            {[
              { id: 'siswa', label: 'Data Siswa', icon: Users, show: !isKesiswaan },
              { id: 'disiplin', label: isKesiswaan ? 'Pantau Harian' : 'Jurnal Harian', icon: CheckSquare, show: true },
              { id: 'rekap_disiplin', label: 'Rekap Kedisiplinan', icon: Table, show: true }, 
              { id: 'settings', label: 'Data Sekolah', icon: Settings, show: isKesiswaan }, 
              { id: 'laporan', label: 'Laporan Bulanan', icon: FileText, show: true },
            ].filter(t => t.show).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id !== 'disiplin') setShowDisciplinePrint(false); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? (isKesiswaan ? "bg-indigo-600 text-white" : "bg-blue-600 text-white") + " shadow-lg" : "bg-white/50 text-slate-600 hover:bg-white hover:text-blue-600"}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6">

             {/* TAB SETTINGS (KHUSUS KESISWAAN) */}
             {activeTab === 'settings' && isKesiswaan && (
              <div className="animate-slide-up grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 h-fit">
                   <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2 border-b pb-2"><School className="w-5 h-5 text-indigo-600"/> Data Pejabat Sekolah</h3>
                   <div className="space-y-4">
                      {/* ... (Data Sekolah Config) ... */}
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                         <h4 className="font-bold text-indigo-800 text-sm mb-2">Kepala Sekolah</h4>
                         <div className="space-y-2">
                            <div><label className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap & Gelar</label><input type="text" value={schoolConfig.headmaster.name} onChange={(e) => handleSchoolConfigChange('headmaster', 'name', e.target.value)} className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300"/></div>
                            <div><label className="text-[10px] uppercase font-bold text-slate-400">NIY</label><input type="text" value={schoolConfig.headmaster.niy} onChange={(e) => handleSchoolConfigChange('headmaster', 'niy', e.target.value)} className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300"/></div>
                         </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                         <h4 className="font-bold text-indigo-800 text-sm mb-2">Kesiswaan (Anda)</h4>
                         <div className="space-y-2">
                            <div><label className="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap & Gelar</label><input type="text" value={schoolConfig.kesiswaan.name} onChange={(e) => handleSchoolConfigChange('kesiswaan', 'name', e.target.value)} className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300"/></div>
                            <div><label className="text-[10px] uppercase font-bold text-slate-400">NIY</label><input type="text" value={schoolConfig.kesiswaan.niy} onChange={(e) => handleSchoolConfigChange('kesiswaan', 'niy', e.target.value)} className="w-full bg-white border border-indigo-200 rounded px-2 py-1.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300"/></div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6">
                   <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2 border-b pb-2"><Users className="w-5 h-5 text-indigo-600"/> Data Guru Wali Kelas</h3>
                   <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left text-xs border-collapse">
                         <thead className="bg-indigo-50 text-indigo-900 sticky top-0">
                            <tr><th className="px-3 py-2 border-b border-indigo-100">Kelas</th><th className="px-3 py-2 border-b border-indigo-100">Nama Guru</th><th className="px-3 py-2 border-b border-indigo-100">NIY</th></tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {teachers.filter(t => t.class !== 'KESISWAAN').map((teacher) => (
                               <tr key={teacher.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-bold text-center bg-slate-50 w-16">
                                     <input type="text" value={teacher.class} onChange={(e) => handleTeacherDataUpdate(teacher.id, 'class', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 text-center font-bold focus:border-indigo-400 outline-none"/>
                                  </td>
                                  <td className="px-3 py-2">
                                     <input type="text" value={teacher.name} onChange={(e) => handleTeacherDataUpdate(teacher.id, 'name', e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 outline-none py-1"/>
                                  </td>
                                  <td className="px-3 py-2 w-24">
                                     <input type="text" value={teacher.niy || ''} onChange={(e) => handleTeacherDataUpdate(teacher.id, 'niy', e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-400 outline-none py-1 font-mono text-slate-500" placeholder="-"/>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-xs rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Perubahan data kelas, guru, dan NIY akan otomatis tersimpan.</p>
                   </div>
                </div>
              </div>
             )}
            
            {/* TAB SISWA */}
            {activeTab === 'siswa' && !isKesiswaan && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
                {/* Form Add Siswa */}
                <div className="lg:col-span-1">
                   <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-blue-600" /> {isBatchMode ? 'Input Batch' : 'Tambah Siswa'}</h3>
                        <button onClick={() => setIsBatchMode(!isBatchMode)} className={`text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1 ${isBatchMode ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'}`}>{isBatchMode ? <User className="w-3 h-3"/> : <List className="w-3 h-3"/>} {isBatchMode ? 'Manual' : 'Batch'}</button>
                      </div>
                      
                      {!isBatchMode && (
                        <form onSubmit={handleAddStudent} className="space-y-4">
                          <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({...studentForm, name: e.target.value})} className="bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 w-full px-4 py-2" placeholder="Nama Siswa..." required />
                          <div className="grid grid-cols-2 gap-3">
                            <select value={studentForm.gender} onChange={(e) => setStudentForm({...studentForm, gender: e.target.value})} className="bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 w-full px-4 py-2">
                               <option value="L">Laki-laki</option>
                               <option value="P">Perempuan</option>
                            </select>
                            <input type="text" value={studentForm.nisn} onChange={(e) => setStudentForm({...studentForm, nisn: e.target.value})} className="bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 w-full px-4 py-2" placeholder="NISN" />
                          </div>
                          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Simpan Data</button>
                        </form>
                      )}
                      
                      {isBatchMode && (
                         <form onSubmit={handleBatchAddStudent} className="space-y-4">
                            <textarea value={batchInput} onChange={(e) => setBatchInput(e.target.value)} className="bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 w-full px-4 py-3 h-48 text-xs font-mono" placeholder={`Contoh:\nAhmad\nBudi`} required></textarea>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Simpan Batch</button>
                         </form>
                      )}
                   </div>
                </div>

                <div className="lg:col-span-2">
                   <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden p-4">
                      <h3 className="font-bold text-slate-700 mb-3 text-sm md:text-base">Daftar Siswa Kelas {viewingClass}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                           <thead className="bg-blue-50/50 text-blue-800 border-b border-blue-100 text-[10px] uppercase">
                              <tr><th className="px-4 py-3">No</th><th className="px-4 py-3">Nama Siswa</th><th className="px-4 py-3 text-center">L/P</th><th className="px-4 py-3">NISN</th><th className="px-4 py-3 text-center">Aksi</th></tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {getFilteredStudents().map((s, idx) => (
                                <tr key={s.id} className="hover:bg-white/50 text-[11px]">
                                  <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                                  <td className="px-4 py-3">
                                      <input 
                                        type="text" 
                                        value={s.name} 
                                        onChange={(e) => handleStudentNameChange(s.id, e.target.value)}
                                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 outline-none w-full font-bold text-slate-700" 
                                      />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                     <select 
                                        value={s.gender || 'L'} 
                                        onChange={(e) => handleGenderChange(s.id, e.target.value)}
                                        className={`bg-transparent border-b border-dashed border-slate-300 text-center font-bold outline-none w-12 cursor-pointer ${s.gender === 'P' ? 'text-pink-600' : 'text-blue-600'}`}
                                     >
                                        <option value="L">L</option>
                                        <option value="P">P</option>
                                     </select>
                                  </td>
                                  <td className="px-4 py-3"><input type="text" value={s.nisn} onChange={(e) => handleNisnChange(s.id, e.target.value)} className="bg-transparent border-b border-dashed border-slate-200 outline-none w-24" placeholder="..." /></td>
                                  <td className="px-4 py-3 text-center text-red-400 hover:text-red-600 cursor-pointer" onClick={() => handleDeleteStudent(s.id)}><Trash2 className="w-4 h-4 mx-auto" /></td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* TAB 2: JURNAL KEDISIPLINAN (HARIAN) */}
            {(activeTab === 'disiplin' || activeTab === 'pantau_harian') && (
              <div className="animate-slide-up space-y-6">
                {!showDisciplinePrint ? (
                  <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl overflow-hidden flex flex-col">
                      <div className={`p-4 ${isKesiswaan ? 'bg-indigo-50 text-indigo-800' : 'bg-emerald-50 text-emerald-800'} font-bold border-b text-sm md:text-base flex justify-between items-center`}>
                        <span>{isKesiswaan ? `Pantau Harian (${viewingClass})` : `Jurnal Harian (${viewingClass})`}</span>
                        <div className="flex items-center gap-2"><GenericDateNavigator date={disciplineDate} setDate={setDisciplineDate} /></div>
                      </div>
                      <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
                              <tr>
                                  <th className="px-4 py-4 w-12 text-center border-b border-r align-middle">No</th>
                                  <th className="px-4 py-4 w-48 border-b border-r min-w-[200px] align-middle">Nama Siswa</th>
                                  {disciplineIndicators.map((ind, i) => (
                                    <th key={i} className={`px-1 py-4 border-b align-bottom text-center w-10 ${isAkhwatIndicator(ind.label) ? 'bg-pink-100 text-pink-700' : 'bg-slate-50/50'}`}>
                                      <div className="flex items-center justify-center h-[180px] w-8 mx-auto">
                                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-[9px] font-black tracking-wider uppercase">{ind.label}</span>
                                      </div>
                                    </th>
                                  ))}
                                  <th className="px-4 py-4 w-48 border-b border-l text-center align-middle">Catatan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white/50 text-[10px]">
                              {getFilteredStudents().map((student, idx) => {
                                const checkData = isKesiswaan ? {indicators:{}, notes: getSavedNote(student.id, disciplineDate)} : (dailyChecklist[student.id] || { indicators: {} });
                                return (
                                    <tr key={student.id} className="hover:bg-blue-50/20 transition-colors">
                                      <td className="px-4 py-3 text-center text-slate-400 font-mono border-r">{idx + 1}</td>
                                      <td className="px-4 py-3 font-bold text-slate-800 border-r">{student.name}</td>
                                      {disciplineIndicators.map((ind, i) => {
                                          const isChecked = isKesiswaan ? getSavedStatus(student.id, disciplineDate, ind.label) : checkData.indicators[i] === true;
                                          const isAkhwatItem = isAkhwatIndicator(ind.label);
                                          const isDisabled = isKesiswaan || (student.gender === 'L' && isAkhwatItem);

                                          return (
                                              <td key={i} className={`px-1 py-2 text-center border-r ${isAkhwatItem ? 'bg-pink-50/30' : ''}`}>
                                                {isDisabled && !isKesiswaan ? (
                                                   <div className="w-6 h-6 flex items-center justify-center mx-auto text-slate-300 opacity-50 cursor-not-allowed">
                                                      <Ban className="w-3 h-3" />
                                                   </div>
                                                ) : (
                                                  <button onClick={() => toggleDisciplineStatus(student.id, i)} disabled={isDisabled} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all mx-auto ${isChecked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'} ${isDisabled ? 'cursor-default opacity-80' : 'cursor-pointer'}`}>
                                                      {isChecked ? <CheckCircle2 className="w-3 h-3"/> : <Circle className="w-2 h-2"/>}
                                                  </button>
                                                )}
                                              </td>
                                          )
                                      })}
                                      <td className="px-4 py-2 border-l">{isKesiswaan ? <span className="text-slate-500 italic px-2">{checkData.notes || '-'}</span> : <input type="text" placeholder="..." value={checkData.notes || ''} className="w-full bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-[10px]" onChange={(e) => handleDisciplineNoteChange(student.id, e.target.value)} />}</td>
                                    </tr>
                                );
                              })}
                            </tbody>
                        </table>
                      </div>
                      {!isKesiswaan && (
                        <div className="p-4 border-t bg-white/40 flex justify-between items-center">
                          <button onClick={() => setShowDisciplinePrint(true)} className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Printer className="w-4 h-4"/> Preview Cetak Harian</button>
                          <button onClick={saveDisciplineTable} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"><Save className="w-4 h-4"/> Simpan Jurnal</button>
                        </div>
                      )}
                  </div>
                ) : (
                  /* VIEW PRINT HARIAN */
                  <div className="animate-slide-up bg-white p-8 rounded-3xl border border-slate-200 shadow-xl print:border-0 print:shadow-none print:p-0">
                    <div className="flex justify-between items-center mb-8 print:hidden">
                        <button onClick={() => setShowDisciplinePrint(false)} className="text-slate-500 hover:text-slate-700 font-bold flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Kembali</button>
                        <div className="flex gap-2">
                           <button onClick={handlePrint} className="bg-red-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><FileDown className="w-4 h-4"/> PDF</button>
                           <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Cetak</button>
                        </div>
                    </div>
                    <div className="print:block print:w-full text-slate-900 leading-tight">
                        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 flex flex-col items-center">
                          <h1 className="text-xl font-black uppercase tracking-widest text-slate-900">SMPIT IKHTIAR UNHAS</h1>
                          <p className="text-sm font-bold uppercase tracking-widest">LAPORAN KEDISIPLINAN HARIAN SISWA</p>
                          <div className="w-full flex justify-between mt-3 text-[10px] font-black uppercase border-t pt-2 border-slate-200">
                              <span>HARI/TANGGAL: {new Date(disciplineDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span>KELAS: {viewingClass}</span>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[9px] border-collapse border border-slate-300">
                              <thead>
                                <tr className="bg-slate-100 text-slate-900">
                                    <th className="border border-slate-300 px-2 py-2 text-center w-8">No</th>
                                    <th className="border border-slate-300 px-3 py-2 w-48">Nama Siswa</th>
                                    {disciplineIndicators.map((ind, i) => (
                                      <th key={i} className="border border-slate-300 px-1 py-2 text-center"><div className="[writing-mode:vertical-rl] rotate-180 h-24 mx-auto whitespace-nowrap">{ind.label}</div></th>
                                    ))}
                                    <th className="border border-slate-300 px-3 py-2 w-32 text-center">Catatan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getFilteredStudents().map((student, idx) => {
                                  // Use saved data for print preview mostly, or current state if just edited
                                  const checkData = dailyChecklist[student.id] || { indicators: {} }; 
                                  return (
                                      <tr key={student.id}>
                                        <td className="border border-slate-300 px-2 py-1 text-center">{idx + 1}</td>
                                        <td className="border border-slate-300 px-3 py-1 font-bold">{student.name}</td>
                                        {disciplineIndicators.map((ind, i) => {
                                           // Check if blocked for print
                                           const isAkhwatItem = isAkhwatIndicator(ind.label);
                                           const isBlocked = student.gender === 'L' && isAkhwatItem;
                                           return (
                                              <td key={i} className={`border border-slate-300 px-1 py-1 text-center ${isBlocked ? 'bg-slate-100' : ''}`}>
                                                {isBlocked ? '-' : (checkData.indicators[i] === true ? '✓' : '')}
                                              </td>
                                           );
                                        })}
                                        <td className="border border-slate-300 px-2 py-1 italic">{checkData.notes}</td>
                                      </tr>
                                  );
                                })}
                              </tbody>
                          </table>
                        </div>
                        <div className="mt-8 text-[10px] font-medium flex justify-end">
                           <div className="text-center w-48">
                              <p>Makassar, {new Date(disciplineDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                              <p className="font-bold mb-12">Wali Kelas</p>
                              <p className="font-bold underline">{getWaliKelasName(viewingClass)}</p>
                           </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB REKAP KEDISIPLINAN (BARU) */}
            {activeTab === 'rekap_disiplin' && (
              <div className="animate-slide-up space-y-8 bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-xl print:shadow-none print:border-0 print:p-0">
                <div className="flex justify-between items-center mb-8 print:hidden">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Table className="w-6 h-6" /></div>
                      <div>
                         <h2 className="font-bold text-xl">Rekapitulasi Kedisiplinan</h2>
                         <p className="text-sm text-slate-500">Matriks capaian per indikator.</p>
                      </div>
                      <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm font-bold text-indigo-600 outline-none ml-2">
                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={handlePrint} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><FileDown className="w-4 h-4"/> PDF</button>
                     <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Cetak</button>
                   </div>
                </div>

                <div id="print-area" className="print:block print:w-full text-slate-900 leading-tight">
                  <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 flex flex-col items-center">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">SMPIT IKHTIAR UNHAS</h1>
                    <p className="text-sm font-bold uppercase tracking-widest">REKAPITULASI KEDISIPLINAN SISWA</p>
                    <div className="mt-2 text-[10px] text-slate-600 uppercase font-medium">{schoolConfig.address}</div>
                    <div className="w-full flex justify-between mt-4 text-[11px] font-black uppercase border-t pt-2 border-slate-200">
                        <span>BULAN: {reportMonth.toUpperCase()}</span>
                        <span>KELAS: {viewingClass}</span>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[8px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 text-center">
                            <th rowSpan="2" className="border border-slate-300 px-2 py-2 w-8 align-middle">No</th>
                            <th rowSpan="2" className="border border-slate-300 px-2 py-2 w-32 align-middle">Nama Lengkap Siswa</th>
                            {disciplineIndicators.map((ind, i) => (
                              <th key={i} colSpan="2" className={`border border-slate-300 px-1 py-1 ${isAkhwatIndicator(ind.label) ? 'bg-pink-100' : ''}`}>
                                <div className="[writing-mode:vertical-rl] rotate-180 h-24 mx-auto whitespace-nowrap text-[7px] leading-tight">{ind.label}</div>
                              </th>
                            ))}
                            {/* TOTAL HEADER (Removed Poin) */}
                            <th rowSpan="2" className="border border-slate-300 px-1 py-1 text-center bg-blue-100 font-bold align-middle w-10">% TOTAL</th>
                          </tr>
                          <tr className="bg-slate-50 text-slate-700 text-[7px]">
                             {disciplineIndicators.map((_, i) => (
                               <React.Fragment key={i}>
                                  <th className="border border-slate-300 px-0.5 py-0.5 text-center w-5">JML</th>
                                  <th className="border border-slate-300 px-0.5 py-0.5 text-center w-5">%</th>
                               </React.Fragment>
                             ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredStudents().map((s, idx) => {
                            const studentCounts = getMonthlyItemCounts(s.id, reportMonth);
                            // Hari dalam bulan Kalender
                            const totalDaysInMonth = getDaysInMonth(reportMonth);
                            
                            // Total stats
                            const stats = getMonthlyStats(s.id, reportMonth); 

                            return (
                              <tr key={s.id}>
                                <td className="border border-slate-300 px-1 py-1 text-center">{idx + 1}</td>
                                <td className="border border-slate-300 px-2 py-1 font-bold uppercase">{s.name}</td>
                                {disciplineIndicators.map((ind, i) => {
                                  const count = studentCounts[ind.label] || 0;
                                  // Persentase per ITEM = (Jumlah Ceklis / Total Hari Kalender) * 100
                                  const percentage = Math.round((count / totalDaysInMonth) * 100);
                                  
                                  const isAkhwatItem = isAkhwatIndicator(ind.label);
                                  const isBlocked = s.gender === 'L' && isAkhwatItem;

                                  if (isBlocked) {
                                     return (
                                        <React.Fragment key={i}>
                                            <td className="border border-slate-300 px-1 py-1 text-center bg-slate-100">-</td>
                                            <td className="border border-slate-300 px-1 py-1 text-center bg-slate-100">-</td>
                                        </React.Fragment>
                                     )
                                  }

                                  return (
                                    <React.Fragment key={i}>
                                        <td className="border border-slate-300 px-1 py-1 text-center font-bold">{count}</td>
                                        <td className={`border border-slate-300 px-1 py-1 text-center ${percentage < 50 ? 'text-red-500' : 'text-blue-600'}`}>{percentage}%</td>
                                    </React.Fragment>
                                  )
                                })}
                                {/* Removed Total Poin Cell */}
                                <td className="border border-slate-300 px-1 py-1 text-center font-bold bg-blue-50/30 text-blue-700">
                                   {stats.percentage}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-12 page-break-before-always">
                     <h3 className="font-black text-sm uppercase mb-4 border-l-4 border-blue-600 pl-2">II. Grafik Capaian Kedisiplinan Kelas</h3>
                     <div className="h-[300px] w-full bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                        <canvas ref={chartRef}></canvas>
                     </div>
                  </div>

                  <div className="mt-20 print:mt-12 text-[12px] text-slate-900 leading-relaxed font-medium">
                    <div className="grid grid-cols-3 text-center">
                      <div className="flex flex-col h-40">
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala SMPIT IKHTIAR UNHAS</p>
                        <div className="mt-auto">
                          <p className="font-bold underline decoration-1 underline-offset-4">{schoolConfig.headmaster.name}</p>
                          <p className="text-[10px] text-slate-500">NIY. {schoolConfig.headmaster.niy}</p>
                        </div>
                      </div>
                      <div className="flex flex-col h-40">
                        <p>&nbsp;</p>
                        <p className="font-bold">Kesiswaan</p>
                        <div className="mt-auto">
                          <p className="font-bold underline decoration-1 underline-offset-4">{schoolConfig.kesiswaan.name}</p>
                          <p className="text-[10px] text-slate-500">NIY. {schoolConfig.kesiswaan.niy}</p>
                        </div>
                      </div>
                      <div className="flex flex-col h-40">
                        <p>Makassar, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        <p className="font-bold">Wali Kelas {viewingClass}</p>
                        <div className="mt-auto">
                          <p className="font-bold underline decoration-1 underline-offset-4">{getWaliKelasName(viewingClass)}</p>
                          <p className="text-[10px] text-slate-500">NIY. {getTeacherForClass(viewingClass)?.niy || '...................'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB LAPORAN BULANAN (CAPAIAN UMUM) */}
            {activeTab === 'laporan' && (
              <div className="animate-slide-up space-y-8 bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-xl print:shadow-none print:border-0 print:p-0">
                <div className="flex justify-between items-center mb-8 print:hidden">
                   <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Printer className="w-6 h-6" /></div>
                      <div>
                         <h2 className="font-bold text-xl">Laporan Capaian Bulanan</h2>
                         <p className="text-sm text-slate-500">Ringkasan total persentase.</p>
                      </div>
                      <select value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="bg-white border rounded px-2 py-1 text-sm font-bold text-indigo-600 outline-none ml-2">
                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={handlePrint} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><FileDown className="w-4 h-4"/> PDF</button>
                     <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Printer className="w-4 h-4"/> Cetak</button>
                   </div>
                </div>

                <div id="print-area" className="print:block print:w-full text-slate-900 leading-tight">
                  <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 flex flex-col items-center">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">SMPIT IKHTIAR UNHAS</h1>
                    <p className="text-sm font-bold uppercase tracking-widest">LAPORAN CAPAIAN KEDISIPLINAN SISWA</p>
                    <div className="mt-2 text-[10px] text-slate-600 uppercase font-medium">{schoolConfig.address}</div>
                    <div className="w-full flex justify-between mt-4 text-[11px] font-black uppercase border-t pt-2 border-slate-200">
                        <span>BULAN: {reportMonth.toUpperCase()}</span>
                        <span>KELAS: {viewingClass}</span>
                    </div>
                    {/* Added Integration Indicator */}
                    <div className="absolute top-0 right-0 text-[8px] text-slate-300 print:hidden">
                       Total Data: {violations.filter(v => {
                         const student = students.find(s => s.id === v.studentId);
                         if (!student || student.class !== viewingClass) return false;
                         return new Date(v.date).getMonth() === ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].indexOf(reportMonth);
                       }).length}
                    </div>
                  </div>

                  <div className="mb-10">
                    <h3 className="font-black text-sm uppercase mb-3 border-l-4 border-blue-600 pl-2">I. Rekapitulasi Capaian</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900">
                            <th className="border border-slate-300 px-2 py-2 text-center w-8">No</th>
                            <th className="border border-slate-300 px-3 py-2">Nama Lengkap Siswa</th>
                            <th className="border border-slate-300 px-3 py-2 text-center w-24">NISN</th>
                            {/* Removed Total Poin Header */}
                            <th className="border border-slate-300 px-3 py-2 text-center w-32">Persentase (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredStudents().map((s, idx) => {
                            const stats = getMonthlyStats(s.id, reportMonth); 
                            return (
                              <tr key={s.id}>
                                <td className="border border-slate-300 px-2 py-1.5 text-center">{idx + 1}</td>
                                <td className="border border-slate-300 px-3 py-1.5 font-bold uppercase">{s.name}</td>
                                <td className="border border-slate-300 px-3 py-1.5 text-center font-mono">{s.nisn || '-'}</td>
                                {/* Removed Total Poin Cell */}
                                <td className="border border-slate-300 px-3 py-1.5 text-center font-bold text-blue-700">
                                   <div className="flex items-center gap-2 justify-center">
                                      <span>{stats.percentage}%</span>
                                      <div className="w-8 h-1.5 bg-slate-200 rounded-full overflow-hidden print:hidden">
                                         <div className={`h-full ${stats.percentage >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{width: `${stats.percentage}%`}}></div>
                                      </div>
                                   </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mb-12 page-break-before-always">
                     <h3 className="font-black text-sm uppercase mb-4 border-l-4 border-blue-600 pl-2">II. Grafik Visualisasi</h3>
                     <div className="h-[300px] w-full bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                        <canvas ref={chartRef}></canvas>
                     </div>
                  </div>

                  <div className="mt-20 print:mt-12 text-[12px] text-slate-900 leading-relaxed font-medium">
                    <div className="grid grid-cols-3 text-center">
                      <div className="flex flex-col h-40">
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala SMPIT IKHTIAR UNHAS</p>
                        <div className="mt-auto">
                          <p className="font-bold underline decoration-1 underline-offset-4">{schoolConfig.headmaster.name}</p>
                          <p className="text-[10px] text-slate-500">NIY. {schoolConfig.headmaster.niy}</p>
                        </div>
                      </div>
                      <div className="flex flex-col h-40">
                        <p>&nbsp;</p>
                        <p className="font-bold">Kesiswaan</p>
                        <div className="mt-auto">
                          <p className="font-bold underline decoration-1 underline-offset-4">{schoolConfig.kesiswaan.name}</p>
                          <p className="text-[10px] text-slate-500">NIY. {schoolConfig.kesiswaan.niy}</p>
                        </div>
                      </div>
                      <div className="flex flex-col h-40">
                        <p>Makassar, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                        <p className="font-bold">Wali Kelas {viewingClass}</p>
                        <div className="mt-auto">
                          <p className="font-bold underline decoration-1 underline-offset-4">{getWaliKelasName(viewingClass)}</p>
                          <p className="text-[10px] text-slate-500">NIY. {getTeacherForClass(viewingClass)?.niy || '...................'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      <style>{`
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .print\\:hidden { display: none !important; }
          #print-area { display: block !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .container { max-width: 100% !important; width: 100% !important; }
          @page { size: A4 landscape; margin: 1cm; }
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        [writing-mode:vertical-rl] { writing-mode: vertical-rl; }
      `}</style>
    </div>
  );
};

export default App;