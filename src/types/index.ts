export type PrintTech = 'offset' | 'digital' | 'auto';
export type ProductType = 'to_roi' | 'namecard' | 'catalogue' | 'hop_giay' | 'tui_giay' | 'decal' | 'khac';
export type OffsetWorkType = 'self_turn' | 'sheetwise' | 'tumble'; // Tự trở, In 2 bài, Trở nhíp
export type OrderStatus = 'quote' | 'approved' | 'printing' | 'finishing' | 'completed' | 'delivered' | 'cancelled';

export interface PaperType {
  id: number;
  code: string;
  name: string;
  gsm: number;
  parentWidthCm: number;
  parentHeightCm: number;
  priceAbove500: number; // Giá trên 500 tờ (trên ram)
  priceBelow500: number; // Giá dưới 500 tờ (dưới ram)
  pricePerRam: number; // Giá trên ram (tương đương priceAbove500)
  supplier: string; // Nhà cung cấp (NCC)
  pricePerKg?: number; // Không bắt buộc (đã bỏ giá/kg theo yêu cầu)
  unit?: 'ram' | 'kg';
  description?: string;
  isActive: boolean;
}

export interface OffsetMachine {
  id: number;
  name: string;
  maxWidthMm: number;
  maxHeightMm: number;
  minWidthMm: number;
  minHeightMm: number;
  platePrice: number; // Giá kẽm CTP / lá
  setupCost: number; // Phí mở máy in cơ bản (ví dụ dưới 3000 lượt ép)
  stepCost: number; // Đơn giá mỗi 1000 lượt tiếp theo
  defaultWasteSheets: number; // Bù hao canh màu chuẩn (ví dụ 100 tờ)
  gripperMarginMm: number; // Lề kẹp nhíp (10-12mm)
  baseImpressions?: number; // Số lượt in cơ bản trong gói mở máy (mặc định 3000)
  includesPlate?: boolean; // Đã bao gồm kẽm CTP trong phí mở máy
}

export type DigitalMode = 'with_paper' | 'without_paper'; // In nhanh kèm giấy hoặc In gia công không kèm giấy

export interface DigitalPrintGiaCong {
  id: number;
  machineName: string;
  sheetSize: string; // 'A4' | '330x355' | 'A3' | '330x483' | '330x1200'
  widthMm: number;
  heightMm: number;
  paperLt249: number; // Giấy (<249gsm)
  paper250To349: number; // Giấy (250gsm - 349gsm)
  paper350To450: number; // Giấy (350gsm - 450gsm)
  decalPaperPlastic: number; // Decal (giấy - nhựa)
  decalClear: number; // Decal trong
  syntheticPaper: number; // Giấy nhựa (<280gsm)
  pvcPlastic: number; // Nhựa PVC
}

export interface DigitalPrintKemGiay {
  id: number;
  paperCode: string;
  paperName: string;
  gsm: number;
  sheetSize: string; // '325x430' | '325x355'
  widthMm: number;
  heightMm: number;
  price1Side: number; // In 1 mặt + giấy
  price2Side: number; // In 2 mặt + giấy
}

export interface DigitalMachine {
  id: number;
  name: string;
  maxWidthMm: number;
  maxHeightMm: number;
  clickA41Side: number; // Đơn giá in A4 1 mặt
  clickA42Side: number; // Đơn giá in A4 2 mặt
  clickA31Side: number; // Đơn giá in A3/A3+ 1 mặt
  clickA32Side: number; // Đơn giá in A3/A3+ 2 mặt
  defaultWasteSheets: number; // Bù hao giấy (3-5 tờ)
  minCharge: number; // Đơn giá tối thiểu 1 lần in
}

export interface FinishingService {
  id: number;
  code: string;
  name: string;
  category: 'can_mang' | 'can_gap' | 'be' | 'ep_kim' | 'phu_uv' | 'dong_cuon' | 'dan' | 'khac';
  calcType: 'per_m2' | 'per_sheet' | 'per_product' | 'fixed' | 'die_cut';
  unitPrice: number;
  minPrice: number; // Giá tối thiểu mở máy
  setupFee: number; // Tiền làm khuôn (khuôn bế, khuôn ép kim...)
  wastePercent: number; // % bù hao (vd: 2%)
  wasteSheets: number; // Số tờ bù hao cố định
  isActive: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export interface SelectedFinishing {
  serviceId: number;
  sides?: number; // 1 hoặc 2 mặt (đối với cán màng)
  customQuantity?: number;
  foilAreaCm2?: number; // Diện tích ép kim nếu có
  customNote?: string;
}

export interface CalculationInput {
  jobName: string;
  productType: ProductType;
  printTech: PrintTech;
  quantity: number;
  widthMm: number;
  heightMm: number;
  pages?: number;
  bleedMm?: number;
  paperTypeId: number;
  printSides: '1_side' | '2_side';
  colorsFront: number;
  colorsBack: number;
  offsetWorkType?: OffsetWorkType;
  offsetMachineId?: number;
  digitalMachineId?: number;
  digitalMode?: DigitalMode; // 'with_paper' (Kèm giấy xưởng) | 'without_paper' (In gia công Konica)
  customerSuppliedPaper?: boolean; // Nếu in gia công mà khách mang giấy đến -> tiền giấy = 0
  whiteInk?: boolean; // Tùy chọn in mực trắng (Konica C12000)
  selectedFinishing: SelectedFinishing[];
  profitMarginPercent: number;
  discountAmount?: number;
  vatPercent?: number;
}

export interface PaperCutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'vertical' | 'horizontal';
  label?: string;
}

export interface PaperCutBlock {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
}

export interface PaperCutScheme {
  parentWidthMm: number;
  parentHeightMm: number;
  cutType: 'chia_1' | 'chia_2' | 'chia_4' | 'chia_6' | 'chia_8' | 'custom';
  cutDescription: string;
  cutsCount: number;
  cutSheetWidthMm: number;
  cutSheetHeightMm: number;
  blocks: PaperCutBlock[];
  wasteAreaPercent: number;
  cutLines?: PaperCutLine[];
}

export interface BoxCoordinate {
  x: number;
  y: number;
  w: number;
  h: number;
  trimW?: number;
  trimH?: number;
  bleedMm?: number;
  isRotated?: boolean;
  index: number;
}

export interface ImpositionResult {
  parentSheet: {
    widthCm: number;
    heightCm: number;
    name: string;
  };
  printSheet: {
    widthMm: number;
    heightMm: number;
    name: string;
  };
  upsPerPrintSheet: number;
  cutsPerParentSheet: number;
  totalUpsPerParentSheet: number;
  gripperMarginMm: number;
  usableWidthMm: number;
  usableHeightMm: number;
  cols: number;
  rows: number;
  isRotated: boolean;
  boxes: BoxCoordinate[];
  sheetEfficiencyPercent: number;
  cutScheme?: PaperCutScheme;
}

export interface FinishingCostDetail {
  serviceId: number;
  name: string;
  category: string;
  calcType: string;
  quantity: number;
  unitPrice: number;
  setupFee: number;
  subtotal: number;
  wasteSheets: number;
  formula: string;
}

export interface ComparisonItem {
  quantity: number;
  digitalTotal: number;
  digitalUnit: number;
  offsetTotal: number;
  offsetUnit: number;
  recommended: 'offset' | 'digital';
}

export interface CalculationResult {
  imposition: ImpositionResult;
  quantities: {
    productQty: number;
    netPrintSheets: number;
    printWasteSheets: number;
    finishingWasteSheets: number;
    totalPrintSheets: number;
    parentSheetsNeeded: number;
    ramsNeeded: number;
    kgNeeded: number;
  };
  costs: {
    paperCost: number;
    plateCost: number;
    platesCount: number;
    printRunCost: number;
    totalPrintCost: number; // plate + printRun
    finishingCost: number;
    finishingDetails: FinishingCostDetail[];
    totalBaseCost: number;
    profitAmount: number;
    preTaxTotal: number;
    discountAmount: number;
    vatAmount: number;
    finalPrice: number;
    unitPrice: number;
    shortRunFee?: number; // Phí số lượng ít (<50 tờ: +30k, <100 tờ: +20k)
    digitalDetails?: {
      mode: DigitalMode;
      machineName?: string;
      sheetSizeName?: string;
      ratePerSheet: number;
      shortRunFee: number;
      whiteInkCost?: number;
      note?: string;
    };
  };
  chosenTech: 'offset' | 'digital';
  recommendation?: {
    bestTech: 'offset' | 'digital';
    reason: string;
    digitalTotal?: number;
    offsetTotal?: number;
    difference?: number;
    breakEvenQty?: number;
    comparisonTable?: ComparisonItem[];
  };
}

export interface QuoteOrder {
  id: number;
  code: string;
  customerId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerCompany?: string;
  jobName: string;
  productType: ProductType;
  printTech: 'offset' | 'digital';
  quantity: number;
  widthMm: number;
  heightMm: number;
  pages: number;
  paperName: string;
  paperGsm: number;
  parentSize: string;
  printSize: string;
  upsPerSheet: number;
  totalPrintSheets: number;
  totalParentSheets: number;
  paperCost: number;
  printCost: number;
  finishingCost: number;
  totalCost: number;
  profitMarginPercent: number;
  profitAmount: number;
  discountAmount: number;
  vatPercent: number;
  vatAmount: number;
  finalPrice: number;
  unitPrice: number;
  status: OrderStatus;
  notes?: string;
  specJson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  bankAccount: string;
  bankName: string;
  quoteFooterNote: string;
  defaultProfitMargin: number;
  defaultVatPercent: number;
}
