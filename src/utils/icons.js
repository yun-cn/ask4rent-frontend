import { 
  Home, Bot, Search, GraduationCap, MapPin, User, LogOut, 
  Bed, Bath, ArrowRight, Mail, Lock, Eye, EyeOff, 
  Send, X, Lightbulb, Clock, Loader2, CheckCircle,
  AlertTriangle, AlertCircle, Info, Heart, Star,
  Wifi, Car, Zap, Coffee, Dumbbell, Shield, Map,
  Target, Trash2, MousePointer
} from 'lucide-react';

// Icon size configurations
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

// Color configurations for consistent theming
export const ICON_COLORS = {
  primary: 'text-blue-600',
  secondary: 'text-gray-500',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  muted: 'text-gray-400',
  white: 'text-white',
  purple: 'text-purple-600'
};

// Standardized icon components with consistent sizes and colors
export const Icons = {
  // Navigation & UI
  home: (props) => <Home {...props} />,
  search: (props) => <Search {...props} />,
  bot: (props) => <Bot {...props} />,
  user: (props) => <User {...props} />,
  logout: (props) => <LogOut {...props} />,
  close: (props) => <X {...props} />,
  send: (props) => <Send {...props} />,
  arrow: (props) => <ArrowRight {...props} />,
  
  // Location & Places
  mapPin: (props) => <MapPin {...props} />,
  location: (props) => <MapPin {...props} />,
  graduation: (props) => <GraduationCap {...props} />,
  map: (props) => <Map {...props} />,
  target: (props) => <Target {...props} />,
  click: (props) => <MousePointer {...props} />,
  
  // Property Features
  bed: (props) => <Bed {...props} />,
  bath: (props) => <Bath {...props} />,
  
  // Authentication
  mail: (props) => <Mail {...props} />,
  lock: (props) => <Lock {...props} />,
  eye: (props) => <Eye {...props} />,
  eyeOff: (props) => <EyeOff {...props} />,
  
  // Status & Feedback
  lightbulb: (props) => <Lightbulb {...props} />,
  clock: (props) => <Clock {...props} />,
  loader: (props) => <Loader2 className="animate-spin" {...props} />,
  checkCircle: (props) => <CheckCircle {...props} />,
  alert: (props) => <AlertTriangle {...props} />,
  exclamation: (props) => <AlertCircle {...props} />,
  info: (props) => <Info {...props} />,
  heart: (props) => <Heart {...props} />,
  star: (props) => <Star {...props} />,
  
  // Amenities
  wifi: (props) => <Wifi {...props} />,
  car: (props) => <Car {...props} />,
  power: (props) => <Zap {...props} />,
  coffee: (props) => <Coffee {...props} />,
  gym: (props) => <Dumbbell {...props} />,
  security: (props) => <Shield {...props} />,
  trash: (props) => <Trash2 {...props} />
};

// Pre-configured icon combinations for common use cases
export const getIcon = (name, size = 'md', color = 'secondary', className = '') => {
  const IconComponent = Icons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  const sizeValue = ICON_SIZES[size] || size;
  const colorClass = ICON_COLORS[color] || color;
  const combinedClassName = `${colorClass} ${className}`.trim();
  
  return <IconComponent size={sizeValue} className={combinedClassName} />;
};

// Common icon button configurations
export const IconButton = ({ 
  icon, 
  size = 'md', 
  color = 'secondary', 
  className = '', 
  children,
  ...props 
}) => {
  const IconComponent = Icons[icon];
  const sizeValue = ICON_SIZES[size] || size;
  
  return (
    <button className={className} {...props}>
      {IconComponent && <IconComponent size={sizeValue} />}
      {children}
    </button>
  );
};

// Loading spinner component using consistent styling
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeValue = ICON_SIZES[size] || size;
  return (
    <Loader2 
      size={sizeValue} 
      className={`animate-spin ${className}`} 
    />
  );
};

export default Icons;