import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

interface Payment {
  id: string;
  lesson_date: string;
  price: number;
  payment_status: string;
  lesson_type: string;
  tutor: {
    name: string;
  };
}

interface PaymentHistoryProps {
  payments: Payment[];
  loading: boolean;
}

export function PaymentHistory({ payments, loading }: PaymentHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pagado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-500/50">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Fallido
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalSpent = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + Number(p.price), 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Historial de Pagos
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total invertido</p>
            <p className="text-lg font-bold text-foreground">${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{payment.tutor.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(payment.lesson_date), "d MMM yyyy", { locale: es })}
                    {" • "}
                    {payment.lesson_type === "trial" ? "Clase de prueba" : "Clase regular"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">${Number(payment.price).toFixed(2)}</span>
                  {getStatusBadge(payment.payment_status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
