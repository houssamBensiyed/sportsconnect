<?php

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Models\Sport;
use App\Helpers\Response;

class SportController extends Controller
{
    private Sport $sportModel;

    public function __construct()
    {
        parent::__construct();
        $this->sportModel = new Sport();
    }

    /**
     * Get all sports
     * GET /sports
     */
    public function index(Request $request): void
    {
        $withCount = $request->query('with_coaches') === 'true';

        if ($withCount) {
            $sports = $this->sportModel->getWithCoachCount();
        } else {
            $sports = $this->sportModel->getAll();
        }

        $this->success($sports);
    }

    /**
     * Get single sport
     * GET /sports/{id}
     */
    public function show(Request $request): void
    {
        $id = (int) $request->getParam('id');

        $sport = $this->sportModel->findById($id);

        if (!$sport) {
            $this->error('Sport non trouvé', 404);
            return;
        }

        $this->success($sport);
    }

    /**
     * Get sports by category
     * GET /sports/category/{category}
     */
    public function byCategory(Request $request): void
    {
        $category = $request->getParam('category');

        $validCategories = [
            'sports_collectifs',
            'sports_individuels',
            'sports_combat',
            'sports_aquatiques',
            'fitness',
            'autre'
        ];

        if (!in_array($category, $validCategories)) {
            $this->error('Catégorie invalide', 400);
            return;
        }

        $sports = $this->sportModel->getByCategory($category);

        $this->success($sports);
    }

    /**
     * Get all categories
     * GET /sports/categories
     */
    public function categories(Request $request): void
    {
        $categories = $this->sportModel->getCategories();

        $this->success($categories);
    }
}
