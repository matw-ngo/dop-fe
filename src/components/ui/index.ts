// Core UI Components - Handle both default and named exports

// For backward compatibility, also export everything
export * from "./accordion";
export { Accordion } from "./accordion";
export * from "./alert";
export { Alert } from "./alert";
export * from "./alert-dialog";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
export * from "./aspect-ratio";
export { AspectRatio } from "./aspect-ratio";
export * from "./avatar";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export * from "./badge";
export { Badge } from "./badge";
export * from "./breadcrumb";
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
export { default as BreadcrumbNav } from "./breadcrumb-nav";
export * from "./button";
export { Button } from "./button";
export * from "./button-group";
export { ButtonGroup } from "./button-group";
export * from "./calendar";
export { Calendar } from "./calendar";
export * from "./card";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
export * from "./carousel";
export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
export * from "./chart";
export * from "./chart";
export * from "./checkbox";
export { Checkbox } from "./checkbox";
export * from "./collapsible";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
export * from "./command";
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";
export * from "./context-menu";
export {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu";
export * from "./data-table";
export * from "./dialog";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export * from "./drawer";
export {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
export * from "./dropdown-menu";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
export * from "./empty";
export { Empty } from "./empty";
export * from "./error-boundary";
export { ErrorBoundary } from "./error-boundary";
export * from "./field";
export { Field } from "./field";
export * from "./form";
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
export * from "./hover-card";
export { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
export * from "./input";
export { Input } from "./input";
export * from "./input-group";
export { InputGroup } from "./input-group";
export * from "./input-otp";
export { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp";
export * from "./item";
export { Item } from "./item";
export * from "./kbd";
export { Kbd } from "./kbd";
export * from "./label";
export { Label } from "./label";
export * from "./menubar";
export {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./menubar";
export { default as Modal } from "./modal";
export * from "./navigation-menu";
export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";
// OTP Components
export * from "./otp";
export * from "./otp";
export * from "./pagination";
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
export * from "./popover";
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export * from "./progress";
export { Progress } from "./progress";
export * from "./radio-group";
export { RadioGroup } from "./radio-group";
export * from "./resizable";
export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./resizable";
export * from "./scroll-area";
export { ScrollArea } from "./scroll-area";
export * from "./select";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
export type {
  ISelectBoxOption,
  ISelectGroupProps,
} from "./select-group";
export * from "./select-group";
export { SelectGroup } from "./select-group";
export * from "./separator";
export { Separator } from "./separator";
export * from "./sheet";
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
export * from "./sidebar";
export { Sidebar } from "./sidebar";
export * from "./skeleton";
export { Skeleton } from "./skeleton";
export * from "./slider";
export { CustomSlider as Slider } from "./slider";
export * from "./sonner";
export { Toaster as Sonner } from "./sonner";
export * from "./spinner";
export { Spinner } from "./spinner";
export * from "./switch";
export { Switch } from "./switch";
export * from "./table";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
export * from "./tabs";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export * from "./text-input";
export { TextInput } from "./text-input";
export * from "./textarea";
export { Textarea } from "./textarea";
export * from "./toast";
export { Toast, ToastProvider, ToastViewport } from "./toast";
export * from "./toaster";
export { Toaster } from "./toaster";
export * from "./toggle";
export { Toggle } from "./toggle";
export * from "./toggle-group";
export { ToggleGroup, ToggleGroupItem } from "./toggle-group";
export * from "./tooltip";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
