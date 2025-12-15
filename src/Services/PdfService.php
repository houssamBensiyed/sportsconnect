<?php

namespace App\Services;

use TCPDF;

class PdfService
{
    public function __construct()
    {
        // Check if TCPDF class exists (composer autoload)
        if (!class_exists('TCPDF')) {
            // Fallback or throw error if strictly required. 
            // For now, we assume it's there via composer.
        }
    }

    public function generateReservationConfirmation(array $reservation): string
    {
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // Document Information
        $pdf->SetCreator('SportsConnect');
        $pdf->SetAuthor('SportsConnect System');
        $pdf->SetTitle('Confirmation de Réservation #' . $reservation['id']);

        // Default Header/Footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Margins
        $pdf->SetMargins(15, 15, 15);

        // Add Page
        $pdf->AddPage();

        // Content
        $html = '
        <h1>Confirmation de Réservation</h1>
        <p><strong>Référence:</strong> #' . $reservation['id'] . '</p>
        <p><strong>Date:</strong> ' . date('d/m/Y', strtotime($reservation['session_date'])) . '</p>
        <p><strong>Horaire:</strong> ' . substr($reservation['start_time'], 0, 5) . ' - ' . substr($reservation['end_time'], 0, 5) . '</p>
        <hr>
        <h3>Détails</h3>
        <p><strong>Sport:</strong> ' . ($reservation['sport_name'] ?? 'N/A') . '</p>
        <p><strong>Coach:</strong> ' . ($reservation['coach_name'] ?? 'N/A') . '</p>
        <p><strong>Prix:</strong> ' . $reservation['price'] . ' €</p>
        <p><strong>Statut:</strong> ' . ucfirst($reservation['status']) . '</p>
        ';

        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf->Output('reservation_' . $reservation['id'] . '.pdf', 'S');
    }

    public function generateInvoice(array $reservation, ?array $coach, ?array $sportif): string
    {
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetTitle('Facture #' . $reservation['id']);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        $html = '
        <h1>Facture</h1>
        <table border="0" cellspacing="3" cellpadding="4">
            <tr>
                <td>
                    <strong>Émetteur (Coach):</strong><br>
                    ' . ($coach['first_name'] ?? '') . ' ' . ($coach['last_name'] ?? '') . '<br>
                    ' . ($coach['city'] ?? '') . '
                </td>
                <td>
                    <strong>Client (Sportif):</strong><br>
                    ' . ($sportif['first_name'] ?? '') . ' ' . ($sportif['last_name'] ?? '') . '<br>
                    ' . ($sportif['city'] ?? '') . '
                </td>
            </tr>
        </table>
        <br><br>
        <table border="1" cellspacing="0" cellpadding="5">
             <tr style="background-color:#eee;">
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix Unitaire</th>
                <th>Total</th>
            </tr>
            <tr>
                <td>Séance de ' . ($reservation['sport_name'] ?? 'Sport') . '</td>
                <td>1</td>
                <td>' . $reservation['price'] . ' €</td>
                <td>' . $reservation['price'] . ' €</td>
            </tr>
        </table>
        <br>
        <h3>Total à payer: ' . $reservation['price'] . ' €</h3>
        <p>Date de la séance: ' . date('d/m/Y', strtotime($reservation['session_date'])) . '</p>
        ';

        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf->Output('facture_' . $reservation['id'] . '.pdf', 'S');
    }

    public function generateCoachReport(array $coach, array $stats, array $reservations): string
    {
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetTitle('Rapport d\'activité Coach');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        $html = '<h1>Rapport d\'activité</h1>';
        $html .= '<h3>Coach: ' . $coach['first_name'] . ' ' . $coach['last_name'] . '</h3>';
        
        $html .= '<h4>Statistiques Globales</h4>';
        $html .= '<ul>';
        $html .= '<li>Total séances terminées: ' . ($stats['completed_sessions'] ?? 0) . '</li>';
        $html .= '<li>Revenus totaux: ' . ($stats['total_earnings'] ?? 0) . ' €</li>';
        $html .= '</ul>';

        $html .= '<h4>Dernières Réservations</h4>';
        $html .= '<table border="1" cellpadding="4">
            <tr style="background-color:#eee;">
                <th>ID</th>
                <th>Date</th>
                <th>Prix</th>
                <th>Statut</th>
            </tr>';
        
        foreach (array_slice($reservations, 0, 20) as $res) {
            $html .= '<tr>
                <td>' . $res['id'] . '</td>
                <td>' . $res['session_date'] . '</td>
                <td>' . $res['price'] . ' €</td>
                <td>' . $res['status'] . '</td>
            </tr>';
        }
        $html .= '</table>';

        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf->Output('report.pdf', 'S');
    }

    public function generateSportifHistory(array $sportif, array $reservations, array $stats): string
    {
        $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $pdf->SetTitle('Historique Sportif');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        $html = '<h1>Historique des Séances</h1>';
        $html .= '<h3>Sportif: ' . $sportif['first_name'] . ' ' . $sportif['last_name'] . '</h3>';
        
        $html .= '<ul>';
        $html .= '<li>Total séances: ' . ($stats['total_sessions'] ?? 0) . '</li>';
        $html .= '<li>Total dépensé: ' . ($stats['total_spent'] ?? 0) . ' €</li>';
        $html .= '</ul>';

        $html .= '<table border="1" cellpadding="4">
            <tr style="background-color:#eee;">
                <th>Date</th>
                <th>Sport</th>
                <th>Coach</th>
                <th>Prix</th>
            </tr>';
        
        foreach ($reservations as $res) {
            $html .= '<tr>
                <td>' . $res['session_date'] . '</td>
                <td>' . ($res['sport_name'] ?? '-') . '</td>
                <td>' . ($res['coach_name'] ?? '-') . '</td>
                <td>' . $res['price'] . ' €</td>
            </tr>';
        }
        $html .= '</table>';

        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf->Output('history.pdf', 'S');
    }
}
