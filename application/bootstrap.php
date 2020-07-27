<?php
declare(strict_types=1);

require __DIR__.'/vendor/autoload.php';

use App\Twig\BadgeExtension;
use Symfony\Component\VarDumper\Cloner\VarCloner;
use Symfony\Component\VarDumper\Dumper\HtmlDumper;
use Symfony\Component\Yaml\Yaml;
use Twig\Loader\FilesystemLoader;
use Twig\Environment;
use Twig\TwigFunction;

$debugMode = ($_SERVER['APP_ENV'] ?? 'dev') !== 'prod';

$templateDir = __DIR__."/templates";
$loader = new FilesystemLoader($templateDir);
$twig = new Environment($loader, ['debug' => $debugMode]);
$twig->addExtension(new BadgeExtension(Yaml::parseFile(__DIR__."/config/badges.yaml")));
if ($debugMode) {
    $twig->addFunction(
        new TwigFunction(
            'dump', function ($var) {
            $cloner = new VarCloner();
            $dumper = new HtmlDumper();

            return $dumper->dump($cloner->cloneVar($var));
        }
        )
    );
}
