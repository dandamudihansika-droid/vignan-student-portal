# My Student Portal Project - Simple Version

## My Idea
I wanted to create a simple student portal to help track study time and attendance.

## What I Made (Simple Code)

### 1. Simple Login Page
```javascript
// Login.js - Very simple login
function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  
  const login = () => {
    if (studentId && password) {
      alert('Welcome ' + studentId);
    }
  };
  
  return (
    <div>
      <h1>Login</h1>
      <input 
        placeholder="Student ID" 
        onChange={(e) => setStudentId(e.target.value)}
      />
      <input 
        type="password"
        placeholder="Password" 
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}
```

### 2. Simple Timer
```javascript
// StudyTimer.js - Basic timer
function StudyTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(() => {
        setSeconds(seconds + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  });
  
  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  
  return (
    <div>
      <h1>Study Timer</h1>
      <p>Time: {seconds} seconds</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### 3. Simple Attendance
```javascript
// Attendance.js - Basic attendance
function Attendance() {
  const [subjects, setSubjects] = useState([
    { name: 'Math', present: false },
    { name: 'Physics', present: false },
    { name: 'Chemistry', present: false }
  ]);
  
  const markAttendance = (index) => {
    const newSubjects = [...subjects];
    newSubjects[index].present = !newSubjects[index].present;
    setSubjects(newSubjects);
  };
  
  return (
    <div>
      <h1>Mark Attendance</h1>
      {subjects.map((subject, index) => (
        <div key={index}>
          <span>{subject.name}: </span>
          <button 
            onClick={() => markAttendance(index)}
            style={{color: subject.present ? 'green' : 'red'}}
          >
            {subject.present ? 'Present' : 'Absent'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Simple Dashboard
```javascript
// Dashboard.js - Basic dashboard
function Dashboard() {
  const [studyTime, setStudyTime] = useState(120);
  const [attendance, setAttendance] = useState(85);
  
  return (
    <div>
      <h1>My Dashboard</h1>
      <p>Study Time Today: {studyTime} minutes</p>
      <p>Attendance: {attendance}%</p>
      <p>Keep up the good work!</p>
    </div>
  );
}
```

### 5. Main App
```javascript
// App.js - Very simple routing
function App() {
  const [page, setPage] = useState('login');
  
  if (page === 'login') {
    return <Login onLogin={() => setPage('dashboard')} />;
  }
  
  if (page === 'dashboard') {
    return (
      <div>
        <button onClick={() => setPage('timer')}>Study Timer</button>
        <button onClick={() => setPage('attendance')}>Attendance</button>
        <Dashboard />
      </div>
    );
  }
  
  if (page === 'timer') {
    return (
      <div>
        <button onClick={() => setPage('dashboard')}>Back</button>
        <StudyTimer />
      </div>
    );
  }
  
  if (page === 'attendance') {
    return (
      <div>
        <button onClick={() => setPage('dashboard')}>Back</button>
        <Attendance />
      </div>
    );
  }
}
```

### 6. Simple CSS
```css
/* Simple styles */
body {
  font-family: Arial;
  margin: 20px;
}

button {
  margin: 5px;
  padding: 10px;
  background: blue;
  color: white;
  border: none;
  cursor: pointer;
}

input {
  margin: 5px;
  padding: 10px;
  border: 1px solid gray;
}

h1 {
  color: navy;
}
```

## How It Works

### What I Did:
1. **Made a login page** - Simple student ID and password
2. **Created a timer** - Counts seconds when you press start
3. **Added attendance** - Click buttons to mark present/absent
4. **Built a dashboard** - Shows simple stats
5. **Connected everything** - Basic navigation between pages

### The Logic:
- Use `useState` to remember data
- Use `useEffect` for the timer
- Use simple buttons for navigation
- Use `alert()` for messages (easy way)

### Things I Learned:
- How to use React hooks
- How to make a timer work
- How to handle user input
- How to style with CSS
- How to organize components

## Future Ideas (What I Want to Add)
- Save data to database
- Add more subjects
- Make better charts
- Add profile page
- Mobile version

---

## Project Summary

**This is my first big project!**

I created it to help students like me track:
- Study time
- Attendance  
- Basic progress

The code is simple but it works! I learned a lot making this.

**Total files: 5 main files**
**Lines of code: About 200 lines**
**Time taken: 2 weeks**

I'm proud of this project and want to keep improving it!

---

*Created by a second-year student learning web development*
