import React, { useState, useEffect } from 'react';
import { Send, User, Mail, School, CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react';

const MOCK_DATA = {
  classes: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Class ${i + 1}` })),
  // Program names will be the same for all classes for now
  programName: "Program Name"
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyHQa0U0sVBKjLtOsNpJtSoZvV5VH0Z_eMqszumyQlEpKfYfD0Tuhpju-yCjT7uce5x/exec'

const App = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [studentFields, setStudentFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    if (selectedClass) {
      // 10 students total: 2 for Round 1, 1 for Rounds 2-9
      const fields = [];
      fields.push('round1_student1');
      fields.push('round1_student2');
      
      for (let round = 2; round <= 9; round++) {
        fields.push(`round${round}_student1`);
      }
      
      setStudentFields(fields);

      // Initialize form data
      const newFormData = { class: selectedClass, program: MOCK_DATA.programName };
      fields.forEach(field => {
        newFormData[`${field}_name`] = '';
      });
      setFormData(newFormData);
    } else {
      setStudentFields([]);
      setFormData({});
    }
  }, [selectedClass]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setMessageType('');

    try {
      // Use the new function URL for Sheet2
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(formData)
      });
      console.log("Response:", response);
    } catch (error) {
      console.error("Submission Error:", error);
      if (error.message.includes("Failed to fetch")) {
        setSubmitMessage('Connection Error: Could not reach Google Script (CORS/Network). Ensure your Web App is deployed as "Anyone".');
        setMessageType('error');
      } else {
        setSubmitMessage('Error: ' + error.message);
        setMessageType('error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group student fields by round
  const getStudentsByRound = () => {
    const rounds = [
      { round: 1, fields: ['round1_student1', 'round1_student2'] },
    ];
    
    for (let round = 2; round <= 9; round++) {
      rounds.push({ round, fields: [`round${round}_student1`] });
    }
    
    return rounds;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-10">
          <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
            <School className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Student Registration</h1>
          <p className="text-slate-500 mt-2">Enroll students into programs by class</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Class Selection Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <label htmlFor="classSelect" className="block text-sm font-bold text-slate-700 mb-2">
              Select Academic Class
            </label>
            <div className="relative">
              <select
                id="classSelect"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white transition-all"
                required
              >
                <option value="">-- Choose a Class --</option>
                {MOCK_DATA.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
          </div>

          {/* Program Info Card */}
          {selectedClass && (
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 flex flex-col sm:flex-row justify-between items-center animate-in fade-in slide-in-from-top-4 duration-300">
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Registration Details</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">Class {selectedClass} - {MOCK_DATA.programName}</p>
              </div>
              <div className="mt-4 sm:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm text-center">
                <span className="block text-xs text-gray-500">Total Students</span>
                <span className="block text-xl font-bold text-blue-600">10</span>
              </div>
            </div>
          )}

          {/* Student Fields */}
          {studentFields.length > 0 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center pb-2 border-b border-slate-200">
                <Users className="w-5 h-5 text-slate-400 mr-2" />
                <h2 className="text-xl font-semibold text-slate-800">Student Details by Round</h2>
              </div>
              
              {getStudentsByRound().map(({ round, fields }) => (
                <div key={round} className="bg-slate-50 p-6 rounded-xl border border-slate-200 transition-all hover:shadow-md">
                  <h3 className="font-semibold text-slate-600 mb-4 flex items-center">
                    <span className="bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 text-slate-600">
                      {round}
                    </span>
                    Round {round} - {round === 1 ? '2 Students' : '1 Student'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((field, index) => (
                      <div key={field} className="bg-white p-4 rounded-lg border border-slate-200">
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">
                          Student {index + 1} Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name={`${field}_name`}
                            value={formData[`${field}_name`] || ''}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedClass || isSubmitting}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                !selectedClass || isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {submitMessage && (
          <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 animate-in slide-in-from-bottom-2 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
            )}
            <p className="font-medium">{submitMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;