
import { useState, useEffect } from 'react';
import { BirthDetails } from '@/lib/types';
import InputField from './InputField';
import DatePicker from './DatePicker';
import { Calendar, MapPin, Clock, User } from 'lucide-react';

interface BirthDetailsFormProps {
  onSubmit: (details: BirthDetails) => void;
}

const BirthDetailsForm = ({ onSubmit }: BirthDetailsFormProps) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isStepValid, setIsStepValid] = useState(false);
  
  const steps = [
    { id: 'name', icon: <User size={18} /> },
    { id: 'date', icon: <Calendar size={18} /> },
    { id: 'time', icon: <Clock size={18} /> },
    { id: 'location', icon: <MapPin size={18} /> }
  ];
  
  // Validate current step whenever relevant fields change
  useEffect(() => {
    validateCurrentStep();
  }, [name, date, time, location, activeStep]);
  
  const validateCurrentStep = () => {
    let isValid = false;
    
    switch (activeStep) {
      case 0:
        isValid = !!name.trim();
        break;
      case 1:
        isValid = !!date;
        break;
      case 2:
        isValid = !!time;
        break;
      case 3:
        isValid = !!location.trim();
        break;
      default:
        isValid = false;
    }
    
    setIsStepValid(isValid);
    return isValid;
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!date) newErrors.date = 'Date of birth is required';
    if (!time) newErrors.time = 'Time of birth is required';
    if (!location) newErrors.location = 'Birth location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit({
        name,
        date: date!,
        time,
        location
      });
      
      setIsLoading(false);
    }
  };
  
  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      if (validateCurrentStep()) {
        setActiveStep(activeStep + 1);
      }
    } else {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
  };
  
  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    
    return {
      value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      label: `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`
    };
  });

  return (
    <div className="glass-card w-full max-w-md mx-auto transition-all duration-300 overflow-hidden">
      <div className="bg-gradient-primary text-white p-4 rounded-t-xl">
        <h2 className="text-xl font-cinzel text-center">Birth Details</h2>
      </div>
      
      <div className="p-6 mandala-bg">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="flex flex-col items-center"
              onClick={() => handleStepChange(index)}
            >
              <div 
                className={`relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-300 ${
                  index === activeStep 
                    ? 'bg-gradient-primary text-white' 
                    : index < activeStep 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.icon}
                {index < activeStep && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs mt-1 text-gray-500">{step.id.charAt(0).toUpperCase() + step.id.slice(1)}</span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {activeStep === 0 && (
              <div className="animate-fade-in">
                <InputField
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  error={errors.name}
                  autoFocus
                />
              </div>
            )}
            
            {activeStep === 1 && (
              <div className="animate-fade-in">
                <DatePicker
                  date={date}
                  setDate={setDate}
                  error={errors.date}
                />
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="animate-fade-in">
                <InputField
                  label="Time of Birth"
                  type="dropdown"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  options={timeOptions}
                  error={errors.time}
                />
              </div>
            )}
            
            {activeStep === 3 && (
              <div className="animate-fade-in">
                <InputField
                  label="Birth Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State, Country"
                  error={errors.location}
                />
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              className={`btn-secondary ${activeStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={activeStep === 0}
            >
              Back
            </button>
            
            <button
              type="button"
              onClick={handleNext}
              className={`btn-primary ${!isStepValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || !isStepValid}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spinner mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </div>
              ) : activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BirthDetailsForm;
