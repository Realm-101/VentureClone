import { useState, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ExportDropdownProps {
  analysisId: string;
  stageNumber: number;
  stageName: string;
  businessName: string;
}

export function ExportDropdown({ 
  analysisId, 
  stageNumber, 
  stageName,
  businessName 
}: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'html' | 'json' | 'pdf') => {
    setIsExporting(true);
    
    try {
      const response = await fetch(
        `/api/business-analyses/${analysisId}/stages/${stageNumber}/export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format }),
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      const sanitizedBusinessName = businessName.replace(/[^a-z0-9]/gi, '-');
      const sanitizedStageName = stageName.replace(/[^a-z0-9]/gi, '-');
      a.download = `${sanitizedBusinessName}-Stage-${stageNumber}-${sanitizedStageName}.${format}`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Stage ${stageNumber} exported as ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export Stage ${stageNumber}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isExporting}
          variant="outline"
          className="border-vc-border text-vc-text hover:bg-vc-dark"
          data-testid={`button-export-stage-${stageNumber}`}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-vc-card border-vc-border">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="text-vc-text hover:bg-vc-dark cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('html')}
          disabled={isExporting}
          className="text-vc-text hover:bg-vc-dark cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as HTML
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="text-vc-text hover:bg-vc-dark cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
